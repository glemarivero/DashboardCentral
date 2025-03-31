import { Link } from "wouter";
import { LayoutDashboard } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-secondary text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <LayoutDashboard className="h-5 w-5 mr-2" />
              Dashboard Portal
            </h3>
            <p className="text-white/70 text-sm">
              Your central hub for business intelligence and data visualization tools.
            </p>
          </div>
          <div>
            <h4 className="text-base font-medium mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/"><a className="hover:text-white">All Dashboards</a></Link></li>
              <li><a href="#" className="hover:text-white">Recent Activity</a></li>
              <li><a href="#" className="hover:text-white">Favorites</a></li>
              <li><a href="#" className="hover:text-white">Get Support</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-base font-medium mb-3">Categories</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/category/data"><a className="hover:text-white">Data</a></Link></li>
              <li><Link href="/category/business"><a className="hover:text-white">Business</a></Link></li>
              <li><Link href="/category/ecom"><a className="hover:text-white">ECOM</a></Link></li>
              <li><Link href="/category/strategy"><a className="hover:text-white">Strategy</a></Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-base font-medium mb-3">Resources</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><a href="#" className="hover:text-white">Documentation</a></li>
              <li><a href="#" className="hover:text-white">API Reference</a></li>
              <li><a href="#" className="hover:text-white">Request New Dashboard</a></li>
              <li><a href="#" className="hover:text-white">Contact Admin</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/20 text-center text-white/60 text-sm">
          <p>&copy; {new Date().getFullYear()} Dashboard Portal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
