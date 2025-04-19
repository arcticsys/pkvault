'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BoxManager } from './box';
import Upload from './boxes/upload';

const Sidebar: React.FC = () => {
    const pathname = usePathname();
    
    const navItems = [
        { name: ' Home', path: '/' },
        { name: '󰩪 Vault', path: '/vault' },
    ];

    const bottomItems = [
        { name: 'Upload Save(s)', open: () => BoxManager.show(() => Promise.resolve(<Upload />)) },
    ];

    return (
        <div className="w-[200px] h-screen bg-gray-800 text-white p-4 flex flex-col items-center" style={{ backgroundColor: '#101010', position: 'fixed', top: 0, bottom: 0 }}>
            <div className="text-xl mb-6" style={{ marginTop: '5px', marginBottom: '5px' }}>󰩪 PKVault</div>
            <nav className="w-full mt-4">
                <ul className="w-full space-y-2">
                    {navItems.map((item, index) => (
                        <li key={index} className="w-full">
                            <Link href={item.path} className={`block w-full p-2 rounded border text-center mb-1 ${ pathname === item.path ? 'bg-blue-600 border-blue-600' : 'hover:bg-gray-700 border-gray-600' }`} style={{ marginBottom: '5px', borderRadius: '3px', border: '1px solid #AAA' }}>
                                {item.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="mt-auto">
                <ul className="w-full space-y-2">
                    {bottomItems.map((item, index) => (
                        <li key={index} className="w-full">
                            <button onClick={item.open} className="block w-full p-2 rounded border text-center mb-1 hover:bg-gray-700 border-gray-600" style={{ marginBottom: '5px', borderRadius: '3px', border: '1px solid #AAA' }}>
                                {item.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;