import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useDashboardContext } from "@/context/dashboard-context";
import { 
  ChevronDown, 
  Menu, 
  X,
  LayoutDashboard
} from "lucide-react";
import { Category } from "@shared/schema";

const CATEGORIES = [
  {
    name: "Data",
    slug: "data",
    items: ["Data Visualization", "Data Engineering", "Data Science", "Big Data"]
  },
  {
    name: "Business",
    slug: "business",
    items: ["KPI Overview", "Financial Analytics", "Operations", "HR Metrics"]
  },
  {
    name: "ECOM",
    slug: "ecom",
    items: ["Sales Performance", "Conversion Rate", "Customer Journey", "Inventory Status"]
  },
  {
    name: "Strategy",
    slug: "strategy",
    items: ["Market Analysis", "Competitive Research", "Growth Opportunities", "Long-term Planning"]
  }
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location, navigate] = useLocation();
  const { setSelectedCategory } = useDashboardContext();

  useEffect(() => {
    // Close mobile menu when location changes
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    navigate(`/category/${category}`);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            <span className="font-semibold text-xl tracking-tight">Dashboard Portal</span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex space-x-6">
            {CATEGORIES.map((category) => (
              <div key={category.slug} className="relative group">
                <button 
                  className="flex items-center px-2 py-1 font-medium text-gray-800 hover:text-primary transition-colors"
                  onClick={() => handleCategoryClick(category.slug as Category)}
                >
                  {category.name} <ChevronDown className="ml-1 h-4 w-4 transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <div className="py-2">
                    {category.items.map((item, idx) => (
                      <Link key={idx} href={`/category/${category.slug}`} className="block px-4 py-2 text-gray-800 hover:bg-neutral-light hover:text-primary transition-colors">
                        {item}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              className="text-secondary hover:text-primary" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`md:hidden bg-white border-t border-neutral-medium ${isMobileMenuOpen ? '' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          {CATEGORIES.map((category) => (
            <MobileNavItem 
              key={category.slug} 
              title={category.name} 
              items={category.items} 
              slug={category.slug as Category}
              onCategoryClick={handleCategoryClick}
            />
          ))}
        </div>
      </div>
    </header>
  );
}

interface MobileNavItemProps {
  title: string;
  items: string[];
  slug: Category;
  onCategoryClick: (category: Category) => void;
}

function MobileNavItem({ title, items, slug, onCategoryClick }: MobileNavItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button 
        className="w-full text-left px-3 py-2 flex justify-between items-center text-gray-800 font-medium"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        <ChevronDown 
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      <div className={`pl-4 ${isOpen ? '' : 'hidden'}`}>
        {items.map((item, idx) => (
          <Link 
            key={idx} 
            href={`/category/${slug}`}
            className="block px-3 py-2 text-gray-800 hover:text-primary transition-colors"
            onClick={(e) => {
              e.preventDefault();
              onCategoryClick(slug);
            }}
          >
            {item}
          </Link>
        ))}
      </div>
    </div>
  );
}
