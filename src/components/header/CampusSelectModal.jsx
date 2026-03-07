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
  const today = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const getTodayOperatingMeta = (canteen) => {
    const isActiveStatus = canteen?.status === "active";
    const isOffToday = Array.isArray(canteen?.offDates) && canteen.offDates.includes(today);

    if (!isActiveStatus) {
      return {
        isOperatingToday: false,
        dotClass: "bg-info",
        label: "Không hoạt động",
      };
    }

    if (isOffToday) {
      return {
        isOperatingToday: false,
        dotClass: "bg-warning",
        label: "Nghỉ hôm nay",
      };
    }

    return {
      isOperatingToday: true,
      dotClass: "bg-success",
      label: "Hoạt động hôm nay",
    };
  };

  /**
   * ✅ INIT STATE – CHỈ CHẠY 1 LẦN KHI MODAL MỞ
   */
  useEffect(() => {
    if (!open || initializedRef.current) return;

    const initCampus = selectedCampus || campuses?.[0]?._id || "";
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
    fetchCanteens(tempCampus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempCampus]);

  useEffect(() => {
    if (!activeCanteen?.id && !activeCanteen?._id) return;
    if (!Array.isArray(canteens) || canteens.length === 0) return;

    const currentId = activeCanteen?._id || activeCanteen?.id;
    const fullCanteen = canteens.find((item) => String(item._id) === String(currentId));
    if (fullCanteen) {
      setActiveCanteen(fullCanteen);
      setTempCanteen(fullCanteen._id);
    }
  }, [activeCanteen?._id, activeCanteen?.id, canteens]);

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
    () => campuses?.find((c) => String(c._id) === String(tempCampus)) || {},
    [campuses, tempCampus]
  );

  const activeOperatingMeta = useMemo(() => {
    if (!activeCanteen) return null;
    return getTodayOperatingMeta(activeCanteen);
  }, [activeCanteen, today]);

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
                  key={c._id}
                  onClick={() => {
                    setTempCampus(c._id);
                    setTempCanteen(null);
                    setActiveCanteen(null);
                  }}
                  className={clsx(
                    "rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200",
                    String(tempCampus) === String(c._id)
                      ? "bg-primary text-inverse shadow-lift"
                      : "bg-surface/80 text-muted shadow-card hover:bg-surface hover:shadow-lift"
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
            {error && <p className="text-sm text-danger">{error}</p>}

            <div className="mt-2 flex flex-wrap gap-2">
              {canteens.map((c) => {
                const operatingMeta = getTodayOperatingMeta(c);
                return (
                  <button
                    key={c._id}
                    title={`${operatingMeta.label} | ${c.openingTime || "--:--"} - ${c.closingTime || "--:--"}`}
                    disabled={c.status !== "active"}
                    onClick={() => {
                      setTempCanteen(c._id);
                      setActiveCanteen(c);
                    }}
                    className={clsx(
                      "rounded-full px-4 py-1.5 text-sm flex items-center gap-2 font-medium transition-all duration-200",
                      tempCanteen === c._id
                        ? "bg-primary text-inverse shadow-lift"
                        : "bg-surface/80 text-muted shadow-card hover:bg-surface hover:shadow-lift",
                      c.status !== "active" && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <span
                      className={clsx(
                        "h-2 w-2 rounded-full",
                        operatingMeta.dotClass
                      )}
                    />
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>

          {activeCanteen && (
            <div className="rounded-card bg-surfaceMuted p-3 shadow-card">
              <div className="font-semibold">{activeCanteen.name}</div>
              <div className="text-sm text-muted flex items-center gap-2">
                <span className={clsx("h-2.5 w-2.5 rounded-full", activeOperatingMeta?.dotClass || "bg-info")} />
                <span>Trạng thái hôm nay: {activeOperatingMeta?.label || "Không xác định"}</span>
              </div>
              <div className="text-sm text-muted">
                Giờ hoạt động: {activeCanteen.openingTime || "--:--"} - {activeCanteen.closingTime || "--:--"}
              </div>
              {Array.isArray(activeCanteen.offDates) && activeCanteen.offDates.length > 0 && (
                <div className="text-xs text-muted mt-1">
                  Ngày nghỉ: {activeCanteen.offDates.join(", ")}
                </div>
              )}
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
