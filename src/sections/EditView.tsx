import Header from './Header';
import TextInputArea from './TextInputArea';
import ControlsPanel from './ControlsPanel';

export default function EditView() {
  return (
    <div
      className="flex flex-col"
      style={{
        height: '100vh',
        backgroundColor: 'var(--bg-surface)',
      }}
    >
      <Header />
      <TextInputArea />
      <ControlsPanel />
    </div>
  );
}
