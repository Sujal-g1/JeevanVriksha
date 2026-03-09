import { Scanner } from "@yudiel/react-qr-scanner";
import { useNavigate } from "react-router-dom";

const QRScanner = () => {

  const navigate = useNavigate();

  return (
    <div className="p-8">

      <h1 className="text-2xl font-bold mb-6">
        Scan Patient Health Card
      </h1>

      <Scanner
        onScan={(result) => {
          if (result) {
            const url = result[0].rawValue;

            navigate(url.replace(window.location.origin, ""));
          }
        }}
      />

    </div>
  );
};

export default QRScanner;