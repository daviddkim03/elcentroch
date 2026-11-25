import { expect, test, type Browser, type Page } from "@playwright/test";

const shots = process.env.SHOTS;
const phone = { width: 375, height: 812 };
const desk = { width: 1280, height: 800 };
const errors: string[] = [];

async function open(browser: Browser, viewport = phone) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${page.url()} ${e}`));
  // No outside sites in tests (maps, YouTube).
  await page.route(/google|youtube/, (r) => r.abort());
  return page;
}
async function shot(page: Page, name: string) {
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(wide, `${name} scrolls sideways`).toBeLessThanOrEqual(0);
  if (shots) await page.screenshot({ path: `${shots}/${name}.png`, animations: "disabled" });
}
async function signUp(page: Page, email: string) {
  await page.goto("/login");
  await page.getByRole("button", { name: /계정 만들기/ }).click();
  await page.getByLabel("이메일").fill(email);
  await page.getByLabel("비밀번호", { exact: true }).fill("password1");
  await page.getByRole("button", { name: "계정 만들기", exact: true }).click();
  await expect(page).toHaveURL(/\/my/);
}
async function apply(page: Page, name: string) {
  await page.getByLabel("이름 *").fill(name);
  await page.getByLabel("전화번호").fill("760-555-0100");
  await page.getByRole("button", { name: "신청하기" }).click();
  await expect(page.getByRole("heading", { name: "승인을 기다리고 있습니다" })).toBeVisible();
}
const save = (page: Page, label = "저장") => page.getByRole("dialog").getByRole("button", { name: label, exact: true }).click();

test.describe.configure({ mode: "serial" });
let pastor: Page, ann: Page, ben: Page;

test("visitor sends a visit form", async ({ browser }) => {
  const p = await open(browser);
  await p.goto("/visit");
  await p.getByRole("button", { name: "보내기" }).click();
  await expect(p.getByText("필수 항목입니다.").first()).toBeVisible();
  await p.getByLabel("이름").fill("방문자");
  await p.getByLabel("전화 또는 이메일").fill("760-555-0199");
  await shot(p, "visit-phone");
  await p.getByRole("button", { name: "보내기" }).click();
  await expect(p.getByText("감사합니다")).toBeVisible();
});

test("signed-out people get a sign-in form, not data", async ({ browser }) => {
  const p = await open(browser);
  for (const path of ["/my/directory", "/admin/members"]) {
    await p.goto(path);
    await expect(p.getByRole("heading", { name: "로그인" })).toBeVisible();
  }
  await shot(p, "login-phone");
  await p.getByLabel("이메일").fill("no@x.test");
  await p.getByLabel("비밀번호", { exact: true }).fill("wrongpass");
  await p.getByRole("button", { name: "로그인", exact: true }).click();
  await expect(p.getByText("이메일 또는 비밀번호가 맞지 않습니다.")).toBeVisible();
});

test("members apply and wait; the pastor approves", async ({ browser, request }) => {
  pastor = await open(browser, desk);
  await signUp(pastor, "pastor@x.test");
  await request.get("http://127.0.0.1:54421/test/superadmin?email=pastor@x.test");
  ann = await open(browser);
  ben = await open(browser);
  await signUp(ann, "ann@x.test");
  await shot(ann, "apply-phone");
  await apply(ann, "박안나");
  await shot(ann, "pending-phone");
  await signUp(ben, "ben@x.test");
  await apply(ben, "이벤");
  await ann.goto("/admin");
  await expect(ann.getByText("관리자 권한이 없습니다")).toBeVisible();
  await ann.goto("/my/directory");
  await expect(ann.getByText("승인을 기다리고")).toBeVisible();

  await pastor.goto("/admin");
  await expect(pastor.getByText("박안나")).toBeVisible();
  await expect(pastor.getByText("방문자")).toBeVisible();
  await shot(pastor, "dashboard-desk");
  for (const n of ["박안나", "이벤"]) {
    const row = pastor.getByRole("listitem").filter({ hasText: n });
    await row.getByRole("button", { name: "승인" }).click();
    await expect(row).toHaveCount(0);
  }
  await ann.getByRole("button", { name: "다시 확인" }).click();
  await expect(ann.getByRole("heading", { name: "교인 주소록" })).toBeVisible();
  await ben.getByRole("button", { name: "다시 확인" }).click();
  await expect(ben.getByRole("heading", { name: /이벤님/ })).toBeVisible();
});

test("a request links to a record the church already has", async ({ browser }) => {
  await pastor.goto("/admin/members");
  await pastor.getByRole("button", { name: "교인 추가" }).click();
  await pastor.getByLabel("이름 *").fill("최기존");
  await save(pastor);
  await expect(pastor.getByRole("button", { name: "최기존" })).toBeVisible();
  const c = await open(browser);
  await signUp(c, "choi@x.test");
  await apply(c, "최기존 (신청)");
  await pastor.goto("/admin");
  await pastor.getByLabel("기존 교인 기록과 연결").selectOption({ label: "최기존" });
  await pastor.getByRole("button", { name: "승인" }).click();
  await expect(pastor.getByText("기다리는 신청이 없습니다.")).toBeVisible();
  await c.getByRole("button", { name: "다시 확인" }).click();
  await expect(c.getByRole("heading", { name: "최기존님, 안녕하세요" })).toBeVisible();
});

test("groups, member edit and care notes", async () => {
  await pastor.goto("/admin/groups");
  await pastor.getByRole("button", { name: "추가" }).first().click();
  await pastor.getByLabel("이름 *").fill("1구역");
  await pastor.getByLabel("인도자").selectOption({ label: "박안나" });
  await save(pastor);
  await expect(pastor.getByText("1구역")).toBeVisible();
  await pastor.goto("/admin/members");
  await pastor.getByRole("button", { name: "박안나" }).click();
  await pastor.getByRole("dialog").getByLabel("소그룹").selectOption({ label: "1구역" });
  await pastor.getByRole("dialog").getByLabel("직분").fill("집사");
  await shot(pastor, "member-sheet-desk");
  await save(pastor);
  await expect(pastor.getByRole("cell", { name: "집사" })).toBeVisible();
  await shot(pastor, "members-desk");
  await pastor.getByRole("button", { name: "박안나" }).click();
  await pastor.getByRole("button", { name: "열기" }).click();
  await pastor.getByLabel("내용").fill("병원 심방");
  await save(pastor, "기록 추가");
  await expect(pastor.getByText("병원 심방", { exact: true })).toBeVisible();
  await pastor.goto("/admin/log");
  await expect(pastor.getByText("돌봄 기록 열람").first()).toBeVisible();
  await shot(pastor, "log-desk");
});

test("news with a file, sermon and event reach the right people", async ({ browser }) => {
  await pastor.goto("/admin/news");
  await pastor.getByRole("button", { name: "추가" }).click();
  await pastor.getByLabel("제목 *", { exact: true }).fill("추수감사예배 안내");
  await pastor.getByLabel("내용", { exact: true }).fill("모두 함께해 주세요.");
  await pastor.getByLabel(/^파일/).setInputFiles({ name: "주보 1.pdf", mimeType: "application/pdf", buffer: Buffer.from("x") });
  await pastor.getByLabel("맨 위에 고정").check();
  await save(pastor);
  await expect(pastor.getByText("추수감사예배 안내")).toBeVisible();
  await shot(pastor, "news-admin-desk");

  await pastor.goto("/admin/sermons");
  await pastor.getByRole("button", { name: "추가" }).click();
  await pastor.getByLabel("제목 *", { exact: true }).fill("은혜의 길");
  await pastor.getByLabel("유튜브 주소").fill("not a link");
  await save(pastor);
  await expect(pastor.getByText("유튜브 주소를 확인해 주세요.")).toBeVisible();
  await pastor.getByLabel("유튜브 주소").fill("https://youtu.be/dQw4w9WgXcQ?t=3");
  await save(pastor);
  await expect(pastor.getByText("은혜의 길")).toBeVisible();

  await pastor.goto("/admin/events");
  await pastor.getByRole("button", { name: "추가" }).click();
  await pastor.getByLabel("제목 *", { exact: true }).fill("전교인 식사");
  await pastor.getByLabel("시작").fill("2099-01-03T12:00");
  await pastor.getByLabel("참석 신청 받기").check();
  await pastor.getByLabel(/정원/).fill("2");
  await save(pastor);
  await expect(pastor.getByText("전교인 식사")).toBeVisible();

  await ann.goto("/my");
  await expect(ann.getByText("추수감사예배 안내")).toBeVisible();
  await shot(ann, "my-home-phone");
  const popup = ann.waitForEvent("popup");
  await ann.getByRole("button", { name: "파일 보기" }).click();
  await expect((await popup).locator("body")).toHaveText("file");
  await ann.goto("/my/events");
  await expect(ann.getByText("오후 12:00")).toBeVisible();
  await ann.getByRole("button", { name: "참석 신청" }).click();
  await ann.getByLabel(/인원/).fill("3");
  await save(ann);
  await expect(ann.getByText("자리가 모두 찼습니다.")).toBeVisible();
  await ann.getByLabel(/인원/).fill("2");
  await save(ann);
  await expect(ann.getByText("참석 2명")).toBeVisible();
  await shot(ann, "events-phone");
  await ben.goto("/my/events");
  await expect(ben.getByRole("button", { name: "마감" })).toBeDisabled();
  await pastor.getByRole("button", { name: "신청 명단" }).click();
  await expect(pastor.getByRole("dialog").getByText("박안나")).toBeVisible();

  const v = await open(browser, desk);
  await v.goto("/");
  await expect(v.getByRole("heading", { name: "전교인 식사" })).toBeVisible();
  await v.goto("/sermons");
  await expect(v.getByText("은혜의 길")).toBeVisible();
  await v.goto("/community");
  await expect(v.getByRole("heading", { name: "전교인 식사" })).toBeVisible();
  await expect(v.getByText("추수감사예배 안내")).toHaveCount(0);
});

test("prayer: visibility, praying, answered, undo delete", async () => {
  await ann.goto("/my/prayer");
  for (const [text, who] of [["온교회 기도", "church"], ["목사님 기도", "pastor"], ["구역 기도", "group"]]) {
    await ann.getByRole("button", { name: "기도 부탁하기" }).click();
    await ann.getByLabel(/기도 제목/).fill(text);
    await ann.getByLabel(/누구와/).selectOption(who);
    await save(ann, "나누기");
    await expect(ann.getByText(text)).toBeVisible();
  }
  await ben.goto("/my/prayer");
  await expect(ben.getByText("온교회 기도")).toBeVisible();
  await expect(ben.getByText("목사님 기도")).toHaveCount(0);
  await expect(ben.getByText("구역 기도")).toHaveCount(0);
  await ben.getByRole("button", { name: "기도합니다" }).click();
  await expect(ben.getByRole("button", { name: "기도합니다 1" })).toBeVisible();
  await ben.reload();
  await expect(ben.getByRole("button", { name: "기도합니다 1" })).toBeVisible();
  await shot(ann, "prayer-phone");
  await pastor.goto("/my/prayer");
  await expect(pastor.getByText("목사님 기도")).toBeVisible();
  await ann.getByRole("button", { name: "응답받았어요" }).first().click();
  await expect(ann.getByText("응답됨")).toBeVisible();
  await ann.getByRole("button", { name: "삭제" }).first().click();
  await expect(ann.getByText("구역 기도")).toHaveCount(0);
  await ann.getByRole("button", { name: "되돌리기" }).click();
  await expect(ann.getByText("구역 기도")).toBeVisible();
  await ann.getByRole("button", { name: "삭제" }).first().click();
  await ann.waitForTimeout(5600);
  await ann.reload();
  await expect(ann.getByText("온교회 기도")).toBeVisible();
  await expect(ann.getByText("구역 기도")).toHaveCount(0);
});

test("directory lists only people who opt in", async () => {
  await ben.goto("/my/directory");
  await expect(ben.getByText("아직 등록한 분이 없습니다.")).toBeVisible();
  await ann.goto("/my/profile");
  await ann.getByLabel("교인 주소록에 내 이름 보이기").check();
  await ann.getByRole("button", { name: "저장" }).click();
  await expect(ann.getByText("저장했습니다")).toBeVisible();
  await shot(ann, "profile-phone");
  await ben.reload();
  await expect(ben.getByText("박안나")).toBeVisible();
  await expect(ben.getByText("760-555-0100")).toHaveCount(0);
  await shot(ben, "directory-phone");
});

test("group page, serving swap", async () => {
  await ann.goto("/my/group");
  await ann.getByLabel(/나눔과/).fill("이번 주 모임 감사");
  await ann.getByRole("button", { name: "올리기" }).click();
  await expect(ann.getByText("이번 주 모임 감사", { exact: true })).toBeVisible();
  await shot(ann, "group-phone");
  await ben.goto("/my/group");
  await expect(ben.getByText("아직 소그룹이 정해지지 않았습니다.")).toBeVisible();

  await pastor.goto("/admin/serving");
  await pastor.getByRole("button", { name: "추가" }).click();
  await pastor.getByLabel(/^섬김/).fill("주방");
  await pastor.getByLabel("날짜").fill("2099-01-04");
  await pastor.getByLabel("담당").selectOption({ label: "박안나" });
  await save(pastor);
  await ann.goto("/my/serving");
  await shot(ann, "serving-phone");
  await ann.getByRole("button", { name: "교체 요청" }).click();
  await expect(ann.locator("main").getByText("교체 요청").first()).toBeVisible();
  await ben.goto("/my/serving");
  await ben.getByRole("button", { name: "제가 할게요" }).click();
  await expect(ben.getByText("확정")).toBeVisible();
});

test("attendance, children and giving", async () => {
  await pastor.goto("/admin/attendance");
  await pastor.getByLabel("박안나").check();
  await expect(pastor.getByText("1명 출석")).toBeVisible();
  await pastor.reload();
  await expect(pastor.getByLabel("박안나")).toBeChecked();
  await shot(pastor, "attendance-desk");

  await ann.goto("/my/family");
  await ann.getByRole("button", { name: "자녀 추가" }).click();
  await ann.getByLabel("이름 *").fill("박하늘");
  await ann.getByLabel("알레르기").fill("땅콩");
  await save(ann);
  await expect(ann.getByRole("heading", { name: "박하늘" })).toBeVisible();
  await pastor.goto("/admin/children");
  await pastor.getByRole("button", { name: "체크인", exact: true }).click();
  await expect(pastor.getByRole("button", { name: "체크아웃" })).toBeVisible();
  await shot(pastor, "children-desk");
  await ann.reload();
  const code = (await ann.locator("p.tracking-widest").textContent())!;
  await shot(ann, "family-phone");
  await pastor.getByRole("button", { name: "체크아웃" }).click();
  await pastor.getByLabel("픽업 코드").fill("ZZZZ");
  await pastor.getByLabel("데려가는 사람").fill("엄마");
  await save(pastor, "체크아웃");
  await expect(pastor.getByText("픽업 코드가 맞지 않습니다.")).toBeVisible();
  await pastor.getByLabel("픽업 코드").fill(code.toLowerCase());
  await save(pastor, "체크아웃");
  await expect(pastor.getByText("귀가: 엄마")).toBeVisible();

  await pastor.goto("/admin/giving");
  await pastor.getByRole("button", { name: "기록" }).click();
  await pastor.getByLabel(/^이름/).selectOption({ label: "박안나" });
  await pastor.getByLabel(/금액/).fill("50.25");
  await save(pastor);
  await expect(pastor.getByText("$50.25").first()).toBeVisible();
  await shot(pastor, "giving-desk");
  const dl = pastor.waitForEvent("download");
  await pastor.getByRole("button", { name: "CSV" }).click();
  expect((await dl).suggestedFilename()).toMatch(/giving-\d{4}\.csv/);
  await ann.goto("/my/giving");
  await expect(ann.getByText("$50.25").first()).toBeVisible();
  await shot(ann, "giving-phone");
  await ben.goto("/my/giving");
  await expect(ben.getByText("이 해의 기록이 없습니다.")).toBeVisible();
});

test("admin role: manages people but can't approve or see care notes", async () => {
  await pastor.goto("/admin/access");
  const people = pastor.getByRole("list", { name: "권한이 있는 사람" });
  const give = async (role: string) => {
    await pastor.getByRole("button", { name: "권한 주기" }).click();
    await pastor.getByLabel("이름 *").selectOption({ label: "이벤" });
    await pastor.getByLabel("권한 *").selectOption(role);
    if (role === "superadmin") await shot(pastor, "access-sheet-desk");
    await save(pastor);
    await expect(people.getByRole("listitem").filter({ hasText: "이벤" })).toBeVisible();
  };
  // Handing the church over: a second super admin, then back down to regular pastor and admin.
  await give("superadmin");
  await ben.goto("/admin/access");
  await expect(ben.getByRole("button", { name: "권한 주기" })).toBeVisible();
  await shot(ben, "access-phone");
  for (const role of ["pastor", "member"]) {
    await people.getByRole("listitem").filter({ hasText: "이벤" }).getByRole("button", { name: "변경" }).click();
    await pastor.getByLabel("권한 *").selectOption(role);
    await save(pastor);
    await expect(pastor.getByRole("dialog")).toHaveCount(0);
  }
  await expect(people.getByText("이벤")).toHaveCount(0);
  await give("admin");
  await shot(pastor, "access-desk");
  await ben.goto("/admin/access");
  await expect(ben.getByText("최고 관리자만 볼 수 있습니다.")).toBeVisible();
  await ben.goto("/admin/members");
  await ben.getByRole("button", { name: "박안나" }).click();
  await expect(ben.getByRole("dialog")).toBeVisible();
  await expect(ben.getByText("돌봄 기록")).toHaveCount(0);
  await expect(ben.getByLabel(/권한/)).toHaveCount(0);
  await ben.keyboard.press("Escape");
  await shot(ben, "members-phone");
  await ben.goto("/admin/log");
  await expect(ben.getByText("최고 관리자만 볼 수 있습니다.")).toBeVisible();
});

test("command menu, English, phone menu", async () => {
  await pastor.goto("/admin");
  await expect(pastor.getByRole("heading", { name: "대시보드" })).toBeVisible();
  await pastor.keyboard.press("Control+k");
  await pastor.getByPlaceholder("어디로 갈까요?").fill("Giving");
  await pastor.keyboard.press("Enter");
  await expect(pastor).toHaveURL(/giving/);
  await ben.goto("/admin");
  await ben.getByRole("button", { name: "메뉴" }).click();
  await shot(ben, "admin-menu-phone");
  await ben.getByRole("button", { name: "EN" }).click();
  await expect(ben.getByRole("link", { name: "Dashboard" })).toBeVisible();
  for (const p of ["/admin", "/admin/members", "/my", "/my/profile", "/my/prayer", "/my/events", "/visit"]) {
    await ben.goto(p);
    await ben.waitForLoadState("networkidle");
    await shot(ben, `en${p.replaceAll("/", "-")}`);
  }
});

test("public pages at phone, header breakpoint and desktop widths", async ({ browser }) => {
  for (const width of [375, 1024, 1280]) {
    const p = await open(browser, { width, height: 800 });
    for (const lang of ["ko", "en"]) {
      await p.addInitScript((l) => window === window.top && localStorage.setItem("lang", l), lang);
      for (const path of ["/", "/visit", "/sermons", "/community", "/worship"]) {
        await p.goto(path);
        await p.waitForLoadState("networkidle");
        await shot(p, `pub-${width}-${lang}${path.replaceAll("/", "-")}`);
      }
    }
    await p.context().close();
  }
});

test("email sign-in link and password reset", async ({ browser, request }) => {
  const link = async (type: string, to: string) =>
    (await (await request.get(`http://127.0.0.1:54421/test/link?type=${type}&email=choi@x.test&to=${to}`)).json()).action_link as string;
  const a = await open(browser);
  await a.goto(await link("magiclink", "/my/"));
  await expect(a.getByRole("heading", { name: "최기존님, 안녕하세요" })).toBeVisible();
  const b = await open(browser);
  await b.goto(await link("recovery", "/login/"));
  await b.getByLabel("8자 이상").fill("newpassword1");
  await b.getByRole("button", { name: "저장" }).click();
  await expect(b).toHaveURL(/\/my/);
  await b.goto("/my/profile");
  await b.getByRole("button", { name: "로그아웃" }).click();
  await b.getByLabel("이메일", { exact: true }).fill("choi@x.test");
  await b.getByLabel("비밀번호", { exact: true }).fill("newpassword1");
  await b.getByRole("button", { name: "로그인", exact: true }).click();
  await expect(b.getByRole("heading", { name: "내 정보" })).toBeVisible();
});

test("a deactivated member is locked out", async () => {
  await pastor.goto("/admin/members");
  await pastor.getByRole("button", { name: "박안나" }).click();
  await pastor.getByRole("dialog").getByLabel(/상태/).selectOption("inactive");
  await save(pastor);
  await expect(pastor.getByRole("dialog")).toHaveCount(0);
  await ann.goto("/my");
  await expect(ann.getByText("이용할 수 없는 계정입니다")).toBeVisible();
});

test("no page threw an error", () => {
  expect(errors).toEqual([]);
});
