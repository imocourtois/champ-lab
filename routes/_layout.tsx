import { define } from "@/utils.ts";
import { Footer, Nav, TopBar } from "@/components/Chrome.tsx";

export default define.page(function Layout({ Component, url }) {
  return (
    <div class="wrap">
      <TopBar />
      <Nav active={url.pathname} />
      <Component />
      <Footer />
    </div>
  );
});
