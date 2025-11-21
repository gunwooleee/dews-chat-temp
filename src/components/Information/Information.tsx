import { IoIosInformationCircleOutline } from "react-icons/io";
import { useState } from "react";

interface InformationProps {
  name: string;
  message: string;
}

const Information = ({ name, message }: InformationProps) => {
  const [show, setShow] = useState(false);

  return (
    <div>
      <button
        onClick={() => setShow((prev) => !prev)}
        className="flex items-center text-gray-500 hover:text-gray-700"
      >
        <IoIosInformationCircleOutline />
      </button>

      {show && (
        <div className="absolute bg-white shadow-lg rounded-md p-4 mt-2">
          <h3 className="text-lg font-semibold">{name}</h3>
          <p className="text-sm text-gray-600">{message}</p>
        </div>
      )}
    </div>
  );
};

export default Information;
