const navItems = [
  { title: "Home", href: "#home" },
  { title: "Projects", href: "#projects" },
  { title: "About", href: "#about" },
  { title: "Contact", href: "#contact" },
];

export const Header = () => {
  return (
    <div className="fixed left-1/2 top-3 -translate-x-1/2 z-50">
      <nav className="flex gap-1 p-0.5 border border-white/15 rounded-full bg-white/10 backdrop-blur">
        {navItems.map((item, index) => (
          <a
            href={item.href}
            key={item.title}
            className={
              index === navItems.length - 1
                ? "nav-item bg-white text-gray-900 hover:bg-white/70 hover:text-gray-900"
                : "nav-item"
            }
          >
            {item.title}
          </a>
        ))}
      </nav>
    </div>
  )
};
