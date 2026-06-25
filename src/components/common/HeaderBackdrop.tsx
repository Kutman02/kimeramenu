interface HeaderBackdropProps {
  menuOpen: boolean;
  backdropOpacity: number;
  onClose: () => void;
}

export function HeaderBackdrop({ menuOpen, backdropOpacity, onClose }: HeaderBackdropProps) {
  if (!menuOpen) return null;

  return (
    <button
      type="button"
      className="fixed inset-0 z-60 backdrop-blur-sm transition-colors"
      aria-label="Close menu"
      onClick={onClose}
      style={{ backgroundColor: `rgba(4, 36, 29, ${backdropOpacity})` }}
    />
  );
}
