import { define } from "@/utils.ts";
import { CHAMPION_IDS } from "@/data/champions.ts";

// /lab sans champion -> redirige vers le premier champion disponible.
export const handler = define.handlers({
  GET() {
    return new Response(null, {
      status: 307,
      headers: { location: `/lab/${CHAMPION_IDS[0]}` },
    });
  },
});
