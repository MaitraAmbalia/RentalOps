export default function PortalFooter() {
  return (
    <footer className="bg-bg-card border-t border-border-main py-6 text-center text-xs text-text-muted font-sans transition-colors duration-200 print:hidden">
      &copy; {new Date().getFullYear()} RentalOps Solutions. All rights reserved.
    </footer>
  );
}
