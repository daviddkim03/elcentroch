"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { HeroSlide } from "./site";

export function useHeroSlides() {
  const [data, setData] = useState<HeroSlide[] | undefined>(undefined);

  const refresh = useCallback(async () => {
    if (!supabase) return setData([]);
    const { data, error } = await supabase
      .from("hero_slides")
      .select("*")
      .order("sort_order");
    setData(error ? [] : (data as HeroSlide[]));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, refresh };
}
