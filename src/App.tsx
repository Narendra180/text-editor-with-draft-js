import { useEffect, useRef, useState } from "react";
import { List } from "immutable";
import { Editor, EditorState, RichUtils, DraftHandleValue, getDefaultKeyBinding, KeyBindingUtil, ContentState, ContentBlock, SelectionState, Modifier, genKey, DraftInlineStyle, convertToRaw, convertFromRaw } from "draft-js";
import 'draft-js/dist/Draft.css';
import './App.css';
import { customStyleMap } from "./constants";

type SyntheticKeyboardEvent = React.KeyboardEvent<{}>;

function App() {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const editorRef = useRef(null);

  const focusEditor = () => {
    //@ts-ignore
    editorRef.current?.focus();
  }

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
    const inlineStyleArray = newEditorState.getCurrentInlineStyle().toArray();
    const inlineStyleRemovedState = inlineStyleArray.reduce((editorState, ele) => {
      return RichUtils.toggleInlineStyle(editorState, ele)
    }, newEditorState);
    setEditorState(inlineStyleRemovedState);
    return "handled";
  }

  useEffect(() => {
    const rawJson = localStorage.getItem("draft-js-raw");
    if(rawJson) {
      const contentState = convertFromRaw(JSON.parse(rawJson));
      const newEditorState = EditorState.createWithContent(contentState);
      setEditorState(newEditorState);
    }
  }, [])

  useEffect(() => {
    // console.log({editorState, inlineStyle: editorState.getCurrentInlineStyle(), blockType: RichUtils.getCurrentBlockType(editorState) })
  }, [editorState]);

  const handleCommanStringRemoval = (focusOffset:number, anchorKey:string, currentContent:ContentState) => {
    const selectionToRemove = new SelectionState({
      anchorKey,
      focusKey: anchorKey,
      anchorOffset: 0,
      focusOffset,
      isBackward: false,
      hasFocus: false
    });
    const contentState = Modifier.replaceText(currentContent, selectionToRemove, "");
    const modifiedEditorState = EditorState.createWithContent(contentState);
    const newEditorState = EditorState.moveFocusToEnd(modifiedEditorState);
    setEditorState(newEditorState);
  }

  const keyBindingFn = (e: SyntheticKeyboardEvent): string | null => {
    const { hasCommandModifier } = KeyBindingUtil;
    const hasCmdModifier = hasCommandModifier(e);
    if(hasCmdModifier && e.key === "s") e.preventDefault();

    switch(e.key) {
      case "s": {
        if(hasCmdModifier) {
          // console.log("ctrl + s")
          return "save";
        }
        return null;
      }
      case "Enter": {
        const currentBlockType = RichUtils.getCurrentBlockType(editorState);
        const newEditorState = RichUtils.toggleBlockType(editorState, currentBlockType);
        if(newEditorState) setEditorState(newEditorState);
        return getDefaultKeyBinding(e);
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
        } else if(currentBlockText.length > 1 && currentBlockText.startsWith("# ")) {
          handleCommanStringRemoval(2, anchorKey, currentContent)
        }

        // For Bold Text
        if(currentBlockText.length === 1 && currentBlockText === "*") { 
          const newEditorState = RichUtils.toggleInlineStyle(editorState, "BOLD");
          setEditorState(newEditorState);
        } else if(currentBlockText.length > 1 && currentBlockText.startsWith("* ")) { 
          handleCommanStringRemoval(2, anchorKey, currentContent)
        }

        // For red text.
        if(currentBlockText.length === 2 && currentBlockText === "**") { 
          const newEditorState = RichUtils.toggleInlineStyle(editorState, "red-text");
          setEditorState(newEditorState);
        } else if(currentBlockText.length > 1 && currentBlockText.startsWith("** ")) { 
          handleCommanStringRemoval(3, anchorKey, currentContent);
        }

        // For underlined text
        if(currentBlockText.length === 3 && currentBlockText === "***") {
          const newEditorState = RichUtils.toggleInlineStyle(editorState, "UNDERLINE");
          setEditorState(newEditorState);
        } else if(currentBlockText.length > 1 && currentBlockText.startsWith("*** ")) { 
          handleCommanStringRemoval(4, anchorKey, currentContent);
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

  const handleSaveBtnClick = (e: any) => {
    const raw = convertToRaw(editorState.getCurrentContent());
    const jsonString = JSON.stringify(raw);
    localStorage.setItem("draft-js-raw", jsonString);
  }

  return (
    <div className="app-div">
      <div className="heading-and-save-btn-container">
        <h1 className="heading-h1">Demo Editor by Narendra</h1>
        <div className="save-btn-container">
          <button
            className="save-btn"
            onClick={handleSaveBtnClick}
          >
            Save
          </button>
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
          handleKeyCommand={handleKeyCommand}
          keyBindingFn={keyBindingFn}         
          customStyleMap={customStyleMap}
          handleReturn={handleEnterClick}
        />
      </div>
    </div>
  )
}

export default App;
