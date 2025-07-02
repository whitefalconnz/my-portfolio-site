"use client"

interface ContentWrapperProps {
  isLoading: boolean;
  children: React.ReactNode;
}

export default function ContentWrapper({ isLoading, children }: ContentWrapperProps) {
  // Don't render content at all until loading is complete
  if (isLoading) {
    return null;
  }

  return (
    <div className="page-content">
      {children}
    </div>
  );
}
