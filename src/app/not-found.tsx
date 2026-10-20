import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <p className="font-mono text-6xl font-bold text-gold">404</p>
      <h1 className="mt-4 text-2xl font-bold text-white">页面不存在或名字未收录</h1>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
        你访问的页面不存在;如果是靓号详情页,说明这个名字暂未进入链上索引,
        不代表仍可注册 —— 可以去查询页确认或到链上验证。
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/"
          className="rounded-lg bg-gold px-5 py-2.5 font-medium text-ink transition-colors hover:bg-gold/90"
        >
          返回首页
        </Link>
        <Link
          href="/check"
          className="rounded-lg border border-white/15 px-5 py-2.5 text-zinc-200 transition-colors hover:bg-white/5"
        >
          去查询靓号
        </Link>
      </div>
    </div>
  );
}
