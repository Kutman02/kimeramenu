import type { Language, RestaurantConfig } from '../../../types/menu';

interface HomeFooterProps {
  restaurant: RestaurantConfig;
  currentLanguage: Language;
}

export function HomeFooter({ restaurant, currentLanguage }: HomeFooterProps) {
  return (
    <footer className="bg-gray-800 text-white py-6 sm:py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h3 className="font-bold mb-2">{restaurant.displayName[currentLanguage]}</h3>
          {restaurant.address && <p className="text-gray-400 text-sm">{restaurant.address}</p>}
          {restaurant.phone && <p className="text-gray-400 text-sm">{restaurant.phone}</p>}
        </div>
      </div>
    </footer>
  );
}
