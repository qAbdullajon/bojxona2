const Modal = ({ children }) => {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white p-4 rounded-md">
          {children}
        </div>
      </div>
    );
  };
  
  export default Modal;
  