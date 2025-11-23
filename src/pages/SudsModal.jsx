// src/SudsModal.jsx

function SudsModal({ children, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()} // 안쪽 클릭 시 배경 클릭 이벤트 막기
      >
        <button className="modal-close-btn" onClick={onClose}>
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

export default SudsModal;
