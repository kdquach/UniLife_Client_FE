import { Modal as AntModal } from "antd";

export default function Modal({ open, title, children, onOk, onCancel, okText = "OK", cancelText = "Cancel" }) {
  return (
    <AntModal open={open} title={title} onOk={onOk} onCancel={onCancel} okText={okText} cancelText={cancelText}>
      {children}
    </AntModal>
  );
}
