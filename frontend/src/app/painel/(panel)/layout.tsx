import { MerchantNavbar } from '@/components/merchant/Navbar';
import { MobileBottomNav } from '@/components/merchant/MobileBottomNav';

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff]">
      <MerchantNavbar />
      <main className="flex-1 max-w-[1280px] mx-auto w-full px-4 md:px-8 py-6 pb-24 md:pb-6">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}
