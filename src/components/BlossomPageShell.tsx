import { CherryBlossomTree } from "@/components/CherryBlossomTree";



/** トップ・My Loop など共通の淡い桜背景 */

export function BlossomPageShell({

  children,

  className = "",

}: {

  children: React.ReactNode;

  className?: string;

}) {

  return (

    <div className={`relative min-h-screen overflow-x-hidden ${className}`}>

      <CherryBlossomTree />

      <div className="relative z-10">{children}</div>

    </div>

  );

}

