"use client"

interface ContentWrapperProps {
  isLoading: boolean;
  children: React.ReactNode;
}

// The page is always rendered, so its text is in the HTML the server sends --
// search engines and link previewers that don't run JavaScript used to receive
// an empty page, because this returned null until the loading screen finished.
//
// While the first-load screen is up the content is display:none. That keeps
// everything exactly as it was visually: nothing paints behind the loader, the
// page can't be scrolled underneath it, and lazy images don't start early.
export default function ContentWrapper({ isLoading, children }: ContentWrapperProps) {
  return (
    <div className="page-content" style={isLoading ? { display: "none" } : undefined}>
      {children}
    </div>
  );
}
