import { PANTRY_ESSENTIALS } from '@/types/generator';

export default function EssentialsPanel() {
  return (
    <div className="bg-light-grey p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-dark mb-3">Your Essentials</h3>
      <p className="text-sm text-secondary mb-4">
        We'll assume you have these pantry basics on hand
      </p>
      <div className="flex flex-wrap gap-2">
        {PANTRY_ESSENTIALS.map((essential) => (
          <span
            key={essential}
            className="px-4 py-2 bg-white text-secondary rounded-full text-sm"
          >
            {essential}
          </span>
        ))}
      </div>
    </div>
  );
}
