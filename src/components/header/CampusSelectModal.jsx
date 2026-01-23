import { Modal, Button } from "antd";
import clsx from "clsx";
import { useMemo, useState } from "react";

export default function CampusSelectModal({ open, onClose, campuses, value, onConfirm }) {
  const initialKey = value ?? campuses?.[0]?.key ?? "";
  const [tempCampus, setTempCampus] = useState(initialKey);

  const active = useMemo(() => {
    const first = campuses?.[0];
    return campuses?.find((c) => c.key === tempCampus) || first || { name: "", image: "" };
  }, [campuses, tempCampus]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={720}
      styles={{ body: { padding: 24 } }}
      destroyOnClose
    >
      <div className="grid min-h-90 grid-cols-1 gap-6 md:grid-cols-2">
        {/* LEFT: Image preview (fixed height to avoid layout shifting) */}
        <div className="relative h-60 overflow-hidden rounded-2xl bg-surfaceMuted md:h-90">
          {active?.image ? (
            <img
              src={active.image}
              alt={active.name}
              className="absolute inset-0 h-full w-full object-cover transition-all duration-300"
            />
          ) : null}
        </div>

        {/* RIGHT: Content */}
        <div className="flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-text">Chọn Campus</h3>
            <p className="mt-1 text-sm text-muted">Vui lòng chọn campus bạn muốn sử dụng</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {(campuses || []).map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setTempCampus(c.key)}
                  className={clsx(
                    "rounded-full border px-4 py-1.5 text-sm font-medium transition",
                    tempCampus === c.key
                      ? "border-primary bg-primary text-inverse shadow"
                      : "border-slate-200 bg-white text-text hover:border-primary"
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button onClick={onClose}>Hủy</Button>
            <Button type="primary" disabled={!tempCampus} onClick={() => onConfirm(tempCampus)}>
              Chọn vị trí
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
