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
    if (result && result.length > 0) {

      const scannedUrl = result[0].rawValue;

      try {

        const parsed = new URL(scannedUrl);

        navigate(parsed.pathname);

      } catch (err) {

        console.log("Invalid QR:", scannedUrl);

      }

    }
  }}
/>


    </div>
  );
};

export default QRScanner;