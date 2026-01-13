import React, { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "react-toastify";
import { authAxios } from "../../config/config";

const ClubList = () => {
  const [club, setClub] = useState([]);

  const APP_URL =
    typeof window !== "undefined"
      ? process.env.REACT_APP_BASEURL
      : "";

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const res = await authAxios().get("/club/list");
      setClub(res.data?.data || []);
    } catch {
      toast.error("Failed to fetch clubs");
    }
  };

  const buildQrValue = (clubId) => {
    if (!clubId || !APP_URL) return "";
    return JSON.stringify({
      type: "ATTENDANCE",
      club_id: String(clubId),
      source: "QR",
      redirect: `${APP_URL}/attendance`,
    });
  };

  const downloadQRCode = (clubId) => {
    const canvas = document.getElementById(`qr-download-${clubId}`);
    if (!canvas) return toast.error("QR not found");

    const pngUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = `club_${clubId}_qr.png`;
    link.click();
  };

  return (
    <div className="page--content">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>QR</th>
            <th>Name</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {club.map((c) => {
            const qrValue = buildQrValue(c?.id);

            return (
              <tr key={c.id}>
                <td>
                  {qrValue && (
                    <>
                      <QRCodeCanvas
                        value={qrValue}
                        size={60}
                        level="H"
                        includeMargin
                      />

                      <div style={{ display: "none" }}>
                        <QRCodeCanvas
                          id={`qr-download-${c.id}`}
                          value={qrValue}
                          size={300}
                          level="H"
                          includeMargin
                        />
                      </div>
                    </>
                  )}
                </td>

                <td>{c?.name || "--"}</td>

                <td>
                  <button
                    onClick={() => downloadQRCode(c.id)}
                    className="px-2 py-1 bg-black text-white rounded"
                  >
                    Download
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ClubList;
