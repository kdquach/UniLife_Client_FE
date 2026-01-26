import { Modal, Button } from "antd";
import clsx from "clsx";
import { useMemo, useState, useEffect, useRef } from "react";
import { useCanteen } from "@/hooks/useCanteen";
import { useCampusStore } from "@/store/useCampusStore";

export default function CampusSelectModal({ open, onClose, campuses }) {
  const {
    selectedCampus,
    selectedCanteen,
    setSelectedCampus,
    setSelectedCanteen,
  } = useCampusStore();

  const [tempCampus, setTempCampus] = useState("");
  const [tempCanteen, setTempCanteen] = useState(null);
  const [activeCanteen, setActiveCanteen] = useState(null);

  const { canteens, loading, error, fetchCanteens } = useCanteen();

  const initializedRef = useRef(false);

  // 🔹 Map campus key → name
  const campusKeyToName = (key) =>
    campuses?.find((c) => c.key === key)?.name || "";

  /**
   * ✅ INIT STATE – CHỈ CHẠY 1 LẦN KHI MODAL MỞ
   */
  useEffect(() => {
    if (!open || initializedRef.current) return;

    const initCampus = selectedCampus || campuses?.[0]?.key || "";
    setTempCampus(initCampus);
    setTempCanteen(selectedCanteen?.id || null);
    setActiveCanteen(
      selectedCanteen
        ? { ...selectedCanteen }
        : null
    );

    initializedRef.current = true;
  }, [open, campuses, selectedCampus, selectedCanteen]);

  /**
   * ✅ FETCH CANTEENS – CHỈ PHỤ THUỘC tempCampus
   * ❌ KHÔNG setState UI ở đây
   */
  useEffect(() => {
    if (!tempCampus) return;
    fetchCanteens(campusKeyToName(tempCampus));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempCampus]);

  /**
   * ✅ RESET KHI MODAL ĐÓNG
   */
  useEffect(() => {
    if (!open) {
      initializedRef.current = false;
      setTempCampus("");
      setTempCanteen(null);
      setActiveCanteen(null);
    }
  }, [open]);

  const campusObj = useMemo(
    () => campuses?.find((c) => c.key === tempCampus) || {},
    [campuses, tempCampus]
  );

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={720}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* LEFT */}
        <div className="relative h-60 overflow-hidden rounded-2xl bg-surfaceMuted">
          {campusObj.image && (
            <img
              src={campusObj.image}
              alt={campusObj.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </div>

        {/* RIGHT */}
        <div className="flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Chọn Campus</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {campuses.map((c) => (
                <button
                  key={c.key}
                  onClick={() => {
                    setTempCampus(c.key);
                    setTempCanteen(null);
                    setActiveCanteen(null);
                  }}
                  className={clsx(
                    "rounded-full border px-4 py-1.5 text-sm",
                    tempCampus === c.key
                      ? "bg-primary text-inverse border-primary"
                      : "bg-white border-slate-200"
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold">Chọn Canteen</h4>

            {loading && <p className="text-sm text-muted">Đang tải...</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="mt-2 flex flex-wrap gap-2">
              {canteens.map((c) => (
                <button
                  key={c._id}
                  disabled={c.status !== "active"}
                  onClick={() => {
                    setTempCanteen(c._id);
                    setActiveCanteen(c);
                  }}
                  className={clsx(
                    "rounded-full border px-4 py-1.5 text-sm flex items-center gap-2",
                    tempCanteen === c._id
                      ? "bg-primary text-inverse border-primary"
                      : "bg-white border-slate-200",
                    c.status !== "active" && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <span
                    className={clsx(
                      "h-2 w-2 rounded-full",
                      c.status === "active" ? "bg-green-500" : "bg-blue-500"
                    )}
                  />
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {activeCanteen && (
            <div className="rounded border bg-slate-50 p-3">
              <div className="font-semibold">{activeCanteen.name}</div>
              <div className="text-sm text-muted">
                Trạng thái:{" "}
                {activeCanteen.status === "active"
                  ? "Đang hoạt động"
                  : "Không hoạt động"}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button onClick={onClose}>Hủy</Button>
            <Button
              type="primary"
              disabled={!tempCampus || !tempCanteen}
              onClick={() => {
                setSelectedCampus(tempCampus);
                setSelectedCanteen({
                  id: activeCanteen._id,
                  name: activeCanteen.name,
                  status: activeCanteen.status,
                });
                onClose();
              }}
            >
              Xác nhận
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
