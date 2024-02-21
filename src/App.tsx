import { useState } from "react";
import { Editor, EditorState } from "draft-js";
import 'draft-js/dist/Draft.css';
import './App.css';

function App() {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  return (
    <div className="app-div">
      <div className="heading-and-save-btn-container">
        <h1 className="heading-h1">Demo Editor by Narendra</h1>
        <div className="save-btn-container">
          <button className="save-btn">Save</button>
        </div>
      </div>
      <div className="editor-container">
        <Editor 
          onChange={setEditorState}
          editorState={editorState}
        />
      </div>
    </div>
  )
}

export default App;
