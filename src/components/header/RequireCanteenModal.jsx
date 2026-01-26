import { Modal } from "antd";

export default function RequireCanteenModal({ open, onClose }) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      closable={false}
      maskClosable={false}
    >
      <div className="text-center py-6">
        <div className="text-2xl font-bold mb-2 text-primary">Vui lòng chọn Campus và Căn tin</div>
        <div className="text-muted mb-4">Bạn cần chọn campus và căn tin trước khi tìm kiếm sản phẩm.</div>
        <button
          className="px-6 py-2 rounded-full bg-primary text-white font-semibold text-base mt-2 shadow-md hover:bg-orange-600 transition"
          onClick={onClose}
        >
          Chọn ngay
        </button>
      </div>
    </Modal>
  );
}
