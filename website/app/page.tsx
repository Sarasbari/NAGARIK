import CityMap from '../components/map/CityMap';
import ModeToggle from '../components/ui/ModeToggle';

export default function Home() {
  return (
    <div className="relative h-full">
      <CityMap />
      <div className="absolute top-4 right-4 z-[1000]">
        <ModeToggle />
      </div>
    </div>
  );
}
