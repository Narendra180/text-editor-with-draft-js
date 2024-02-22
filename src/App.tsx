import { ReactNode, useEffect, useRef, useState } from "react";
import { List } from "immutable";
import { Editor, EditorState, RichUtils, DraftHandleValue, getDefaultKeyBinding, KeyBindingUtil, ContentState, ContentBlock, SelectionState, Modifier, genKey } from "draft-js";
import 'draft-js/dist/Draft.css';
import './App.css';

type SyntheticKeyboardEvent = React.KeyboardEvent<{}>;

function App() {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const editorRef = useRef(null);

  const focusEditor = () => {
    //@ts-ignore
    editorRef.current?.focus();
  }

  useEffect(() => {
    console.log(editorState, editorState.getCurrentInlineStyle())
  }, [editorState]);

  const handleEnterClick = (e: SyntheticKeyboardEvent, es: EditorState): DraftHandleValue => {
    const contentState = es.getCurrentContent();
    const newBlock = new ContentBlock({
      key: genKey(),
      type: 'unstyled',
      text: '',
      characterList: List()
    });
    const newBlockMap = contentState.getBlockMap().set(newBlock.getKey(), newBlock)
    const modifiedState = EditorState.createWithContent(
      ContentState.createFromBlockArray(
        newBlockMap.toArray()
      )
    );
    const newEditorState = EditorState.moveFocusToEnd(modifiedState);
    setEditorState(newEditorState);
    return "handled";
  }

  const keyBindingFn = (e: SyntheticKeyboardEvent): string | null => {
    const { hasCommandModifier } = KeyBindingUtil;
    const hasCmdModifier = hasCommandModifier(e);
    if(hasCmdModifier && e.key === "s") e.preventDefault();

    const currentContent = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    const anchorKey = selectionState.getAnchorKey();
    const currentContentBlock = currentContent.getBlockForKey(anchorKey);
    console.log(currentContentBlock.getText());

    console.log(hasCmdModifier, e, e.key)
    switch(e.key) {
      case "s": {
        if(hasCmdModifier) {
          console.log("ctrl + s")
          return "save";
        }
        return null;
      }
      case " ": {
        const selectionState = editorState.getSelection();
        const currentContent = editorState.getCurrentContent();
        const anchorKey = selectionState.getAnchorKey();
        const currentContentBlock = currentContent.getBlockForKey(anchorKey);
        const currentBlockText = currentContentBlock.getText();

        // For Heading
        if(currentBlockText.length === 1 && currentBlockText === "#") {
          const newState = RichUtils.toggleBlockType(editorState, "header-one");
          setEditorState(newState);
        } else if(currentBlockText.length > 1 && currentBlockText[0] === "#") {
          if(currentBlockText.startsWith("# ")) {
            console.log("starts with #space")
          }
          const selectionToRemove = new SelectionState({
            anchorKey,
            focusKey: anchorKey,
            anchorOffset: 0,
            focusOffset: 2,
            isBackward: false,
            hasFocus: false
          });
          const contentState = Modifier.replaceText(currentContent, selectionToRemove, "");
          const modifiedEditorState = EditorState.createWithContent(contentState);
          const newEditorState = EditorState.moveFocusToEnd(modifiedEditorState);
          setEditorState(newEditorState);
          console.log(newEditorState);
        }

        // For Bold Text
        if(currentBlockText.length === 1 && currentBlockText === "*") { 

        }
      }
      default: {
        return getDefaultKeyBinding(e);
      }
    }
  }

  const handleKeyCommand = (command:string, editorState:EditorState):DraftHandleValue => {
    // console.log(command, "command")
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if(newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  }

  return (
    <div className="app-div">
      <div className="heading-and-save-btn-container">
        <h1 className="heading-h1">Demo Editor by Narendra</h1>
        <div className="save-btn-container">
          <button className="save-btn">Save</button>
        </div>
      </div>
      <div 
        className="editor-container"
        onClick={focusEditor}
      >
        <Editor
          ref={editorRef} 
          onChange={setEditorState}
          editorState={editorState}       
          handleReturn={handleEnterClick}
          handleKeyCommand={handleKeyCommand}
          keyBindingFn={keyBindingFn}
        />
      </div>
    </div>
  )
}

export default App;
