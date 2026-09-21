import { CherryBlossomTree } from "@/components/CherryBlossomTree";



/** トップ・My Loop など共通の淡い桜背景 */

export function BlossomPageShell({
  children,
  className = "",
  treeWithContent = false,
}: {
  children: React.ReactNode;
  className?: string;
  /** タイトル画面など、花を本文とひとまとまりにする */
  treeWithContent?: boolean;
}) {
  return (
    <div className={`relative min-h-screen overflow-x-hidden ${className}`}>
      {!treeWithContent && <CherryBlossomTree />}
      <div className="relative z-10 w-full">
        {treeWithContent && <CherryBlossomTree attached />}
        {children}
      </div>
    </div>
  );
}

