import { MdOutlineLocalShipping } from "react-icons/md";

const FreeDeliveryBar = () => (
  <div className="flex items-center gap-3 rounded-2xl bg-mint/30 px-4 py-3 text-sm text-forest">
    <MdOutlineLocalShipping size={20} aria-hidden="true" />
    <p>Standard delivery is free on every order.</p>
  </div>
);

export default FreeDeliveryBar;
