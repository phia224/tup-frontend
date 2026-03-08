interface ProgramCardProps {
  image: string;
  icon: string; // Icon name/emoji for now, can be replaced with actual icon component
  title: string;
  description: string;
  degrees: string[];
  programCount: number;
  onViewAllClick: () => void;
}

export default function ProgramCard({
  image,
  icon,
  title,
  description,
  degrees,
  programCount,
  onViewAllClick,
}: ProgramCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Card Image */}
      <div className="w-full h-48 overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>

      {/* Card Content */}
      <div className="p-3 sm:p-4 md:p-6">
        {/* Icon & Title */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg sm:text-xl">{icon}</span>
          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">
            {title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-2 sm:mb-3 line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Degrees */}
        <div className="mb-2 sm:mb-3">
          {degrees.slice(0, 2).map((degree, index) => (
            <span
              key={index}
              className="text-xs sm:text-sm md:text-base text-gray-700 font-medium"
            >
              {degree}
              {index < Math.min(degrees.length - 1, 1) && ", "}
            </span>
          ))}
        </div>

        {/* Program Count */}
        <p className="text-xs sm:text-sm md:text-base text-gray-500 mb-3 sm:mb-4">
          {programCount} programs available
        </p>

        {/* View All Button */}
        <button
          onClick={onViewAllClick}
          className="font-semibold text-xs sm:text-sm md:text-base transition-colors flex items-center gap-1 hover:opacity-80 w-full sm:w-auto"
          style={{ color: "#A10008" }}
        >
          View All Programs
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
