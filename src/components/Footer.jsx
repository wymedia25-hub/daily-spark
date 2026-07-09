import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 px-5 py-6 dark:border-neutral-800">
      <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-neutral-400">
        <span className="font-medium">© {new Date().getFullYear()} Daily Spark</span>
        <Link to="/about" className="hover:text-neutral-600 dark:hover:text-neutral-300">About</Link>
        <Link to="/contact" className="hover:text-neutral-600 dark:hover:text-neutral-300">Contact</Link>
      </div>
    </footer>
  );
}