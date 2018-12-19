import React, { PureComponent } from 'react'
import uuidv4                   from 'uuid/v4'
import Quill                    from 'quill'
import Delta                    from 'quill-delta'
import { injectIntl,
         FormattedMessage }     from 'react-intl'
import $                        from 'jquery'

import AlertComponent         from '../components/AlertComponent'
import { dataURLtoFile,
         bytesToSize,
         isWhitespace,
         newCanvasSize,
         getOrientation,
         array2Html }         from '../utils/utils'

import * as constants         from '../constants/Constants'

import styles                 from './PttaiEditor.css'

const EDITOR_INPUT_ID     = 'pttai-editor-input'
const IMAGE_CLASS_PREFIX  = 'pttai-editor-img-'

let BlockEmbed  = Quill.import('blots/block/embed');
let Break       = Quill.import('blots/break');

/*                                                       */
/*  Create a Attachment based off the BlockEmbed         */
/*                                                       */
/*  Since quill does not allow heirarchical dom element, */
/*  we use iframe for attachment display in the editor.  */
/*                                                       */
class Attachment extends BlockEmbed {
    static create(params) {
        var node = super.create(params.value);

        node.setAttribute('srcdoc', params.value);
        node.setAttribute('frameborder', '0');
        node.setAttribute('allowfullscreen', true);
        node.setAttribute('width', '100%');
        node.setAttribute('height', '84px');
        node.setAttribute('data-id', params.id);
        node.setAttribute('data-class', params.class);
        node.setAttribute('data-name', params.name);
        node.setAttribute('data-size', params.size);
        node.setAttribute('data-type', params.type);

        return node;
    }

    static value(node) {
        return node.getAttribute('srcdoc');
    }
}

Attachment.blotName   = 'attachment';
Attachment.className  = constants.IFRAME_CLASS_NAME;
Attachment.tagName    = 'iframe';

Break.blotName  = 'break'
Break.tagName   = 'BR'

Quill.register(Break)
Quill.register(Attachment, true);

/*                                                         */
/*  Each line of the array should be wrapped by <p></p>    */
/*                                                         */

function html2Array(html) {

  let tags    = [/<ol>.*?<\/ol>/g, /<ul>.*?<\/ul>/g, /<iframe.*?<\/iframe>/g]
  let result  = html

  /*  1. remove all new line character  */
  result = result.replace(/\r?\n|\r/g, ' ')

  /*  2. wrapped line with <p></p>  */
  tags.forEach((each) => { result = result.replace(each, '<p>$&</p>') })

  /*  3. split html into array  */
  result = result.match(/<p>.*?<\/p>/g);

  /*  4. convert html array to object array */
  result = result.map((htmlStr) => {

    let htmlObj = {
      type: 'text',
      content: '',
      param: {},
    }

    if (htmlStr.indexOf('<p><iframe') === 0) {

      let pElement      = $.parseHTML(htmlStr)[0]
      let iframeElement = pElement.children[0]

      htmlObj.type = 'attachment'
      htmlObj.content = ''
      htmlObj.param = {
        id:     $(iframeElement).data("id"),
        class:  $(iframeElement).data("class"),
        name:   $(iframeElement).data("name"),
        size:   $(iframeElement).data("size"),
        type:   $(iframeElement).data("type"),
      }
    } else {

      htmlObj.type = 'text'
      htmlObj.content = htmlStr
    }

    return htmlObj
  })

  return result
}

function isEmpty(htmlArray) {

  if (!htmlArray || htmlArray.length === 0) {
    return true
  }

  let html = htmlArray.reduce((acc, each) => {

    if (each.type === 'attachment') {
      return acc + 'dirty'
    } else {
      let cleanEach = each.content.replace(/<p>/g,'')
      cleanEach = cleanEach.replace(/<\/p>/g,'')
      cleanEach = cleanEach.replace(/<br>/g,'')
      cleanEach = cleanEach.trim().replace(/\s\s+/g, ' ');
      return acc + cleanEach
    }
  }, '')

  html = html.replace(/\s\s+/g, ' ')

  return html === ''
}

class PttaiEditor extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      id:           `editor-${ uuidv4() }`,
      editor:       {},
      title:        props.articleTitle,
      htmlArray:    props.initHtmlArray || [],
      htmlContent:  props.initHtmlArray ? array2Html(props.initHtmlArray): '',
      attachedObjs: [],
      selection:    { index: 0, length: 0 },
      showAlert:    false,
      titleChanged:   false,
      contentChanged: false,
      alertData: {
        message:    '',
        onClose:    null,
        onConfirm:  null,
      },
    }

    this.onTitleChange      = this.onTitleChange.bind(this);
    this.onInputEnter       = this.onInputEnter.bind(this);
    this.onPrevPageClick    = this.onPrevPageClick.bind(this)
    this.onContentClick     = this.onContentClick.bind(this)
    this.mountQuill         = this.mountQuill.bind(this)
    this.attachmentUpload   = this.attachmentUpload.bind(this)
    this.handleChange       = this.handleChange.bind(this)
    this.onDelete           = this.onDelete.bind(this)
    this.onSubmit           = this.onSubmit.bind(this)
  }

  onDelete() {

    const { onDeleteArticle } = this.props

    let that = this
    this.setState({
      showAlert: true,
      alertData: {
        message: (
            <FormattedMessage
              id="alert.message1"
              defaultMessage="Are you sure you want to delete?"
            />),
        onConfirm: () => {
          that.setState({showAlert: false})
          onDeleteArticle()
        },
        onClose: () => that.setState({showAlert: false})
      }
    })
  }

  onSubmit() {

    const { onSubmitArticle } = this.props
    const { htmlArray, title, attachedObjs } = this.state

    if (isEmpty(htmlArray) || !title || title.replace(/\s+/g, '') === '') {
      let that = this
      this.setState({
        showAlert: true,
        alertData: {
          message: (
            <FormattedMessage
              id="alert.message10"
              defaultMessage="Title or content cannot be empty"
            />),
          onConfirm: () => that.setState({showAlert: false})
        }
      })
    } else {
      /*                                              */
      /* Start submitting article:                    */
      /*                                              */
      /* Replace data-url with attachement ID an      */
      /*  data-url will be replaced back after upload */
      /*                                              */

      let reducedHtmlArray = htmlArray.map((each) => {
        if (each.type === 'attachment') {
          return each
        } else {
          let replaced = each.content
          attachedObjs.forEach((attachment) => { replaced = replaced.replace(attachment.data, attachment.id) })
          each.content = replaced
          return each
        }
      })

      if ((JSON.stringify(reducedHtmlArray).length - 2)*3.032 > constants.MAX_ARTICLE_SIZE) {
        let that = this
        this.setState({
          showAlert: true,
          alertData: {
            message: (
            <FormattedMessage
              id="alert.message16"
              defaultMessage="Max content is {MAX_ARTICLE_SIZE} characters"
              values={{ MAX_ARTICLE_SIZE: constants.MAX_ARTICLE_SIZE }}
            />),
            onConfirm: () => that.setState({showAlert: false})
          }
        })
      } else {
        onSubmitArticle(title, reducedHtmlArray, attachedObjs)
      }
    }
  }

  onTitleChange(e) {
    this.setState({ title:e.target.value })
  }

  onPrevPageClick() {
    const { onCloseArticle, isEdit } = this.props
    const { contentChanged, title, htmlArray } = this.state

    if (isEdit) {
      if (contentChanged) {
        let that = this
        this.setState({
          showAlert: true,
          alertData: {
            message: (
                <FormattedMessage
                  id="alert.message14"
                  defaultMessage="You have edited the article, are you sure you want to leave?"
                />),
            onConfirm: () => {
              that.setState({showAlert: false})
              onCloseArticle()
            },
            onClose: () => that.setState({showAlert: false})
          }
        })
      } else {
        onCloseArticle()
      }
    } else {
      if (!isEmpty(htmlArray) || title || title.replace(/\s+/g, '') !== '') {
        let that = this
        this.setState({
          showAlert: true,
          alertData: {
            message: (
                <FormattedMessage
                  id="alert.message9"
                  defaultMessage="You have unfinished article, are you sure you want to leave?"
                />),
            onConfirm: () => {
              that.setState({showAlert: false})
              onCloseArticle()
            },
            onClose: () => that.setState({showAlert: false})
          }
        })
      } else {
        onCloseArticle()
      }
    }
  }

  onContentClick(e) {
    const { htmlArray } = this.state

    /* focus editor when modal is clicked */
    if (e.target.id !== 'edit-article-modal-main-section') {
      return
    } else if (isEmpty(htmlArray)){
      e.target.children[0].children[0].children[0].focus()
    }
  }

  componentDidMount() {
    this.setState({ editor: this.mountQuill() });

    document.addEventListener("keydown", this.onInputEnter, false);
  }

  componentWillUnmount(){
    document.removeEventListener("keydown", this.onInputEnter, false);
  }

  onInputEnter(e) {
    /* focus editor when press enter or tab */
    if ((e.which === 13 || e.which === 9) && $(':focus').is('input')) {
        $('.' + constants.PTT_EDITOR_CLASS_NAME).focus();
        e.preventDefault()
    }
  }

  mountQuill() {
    const { id, htmlContent } = this.state

    let that    = this
    let editor  = new Quill(`#${id}`, {});

    /*                              */
    /*  Autolink URLs when typing   */
    /*                              */
    editor.clipboard.addMatcher(Node.TEXT_NODE, function(node, delta) {

      let regex = /https?:\/\/[^\s]+/g;
      if(typeof(node.data) !== 'string') return;

      let matches = node.data.match(regex);
      if(matches && matches.length > 0) {
        let ops = [];
        let str = node.data;
        matches.forEach((match) => {
          let split = str.split(match);
          let beforeLink = split.shift();
          ops.push({ insert: beforeLink });
          ops.push({ insert: match, attributes: { link: match } });
          str = split.join(match);
        });
        ops.push({ insert: str });
        delta.ops = ops;
      }

      return delta;
    });

    /*                           */
    /* Clear formatting on paste */
    /*                           */
    editor.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {

      delta.ops = delta.ops.map(op => {

        if (op.insert && op.insert.image) {
          return {
            insert: op.insert,
            attributes: {
              width: '100%',
            }
          }
        } else {
          return {
            insert: op.insert
          }
        }
      })
      return delta
    })

    /*                                                               */
    /* Listening on editor-change                                    */
    /*                                                               */
    /* editor-change emit for both text and selection changes        */
    /*  which is helpful for us to keep track of selection in state  */
    /*  especially when selection event is in silent mode.           */
    /*                                                               */
    editor.on('editor-change', function(eventName, ...args) {

      if (eventName === 'text-change') {
        /* auto link url */
        let delta   = args[0]
        let html    = editor.root.innerHTML
        let regex   = /https?:\/\/[^\s]+$/;

        if(delta.ops.length === 2 && delta.ops[0].retain && isWhitespace(delta.ops[1].insert)) {
          let endRetain = delta.ops[0].retain;
          let text = editor.getText().substr(0, endRetain);
          let match = text.match(regex);

          if(match !== null) {
            let url = match[0];

            let ops = [];
            if(endRetain > url.length) {
              ops.push({ retain: endRetain - url.length });
            }

            ops = ops.concat([
              { delete: url.length },
              { insert: url, attributes: { link: url } }
            ]);

            editor.updateContents({
              ops: ops
            });
          }
        }

        that.handleChange(html, html2Array(html));

      } else if (eventName === 'selection-change') {
        let range     = args[0]
        let oldRange  = args[1]

        if (oldRange && !range) {
          /*  Will temporary lose focus when clicking input file button  */
          /*  so keep the previous selection in this.state.selection.    */
          that.setState({ selection: that.state.selection })
        } else {
          that.setState({ selection: range })
        }
      }
    });

    if (htmlContent !== '') {
      editor.root.innerHTML = htmlContent
    }

    return editor;
  }

  handleChange(html, htmlArray) {
    this.setState({ htmlContent: html, htmlArray: htmlArray, contentChanged: true })
  }

  attachmentUpload(e) {
    const { editor, attachedObjs } = this.state

    let ele         = document.querySelector('#' + EDITOR_INPUT_ID)
    let file        = ele.files[0];
    let fileReader  = new FileReader();
    let imgReader   = new FileReader();
    let that        = this

    if (!file) {
      return
    } else if (!(file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif')) {
      /* file upload */
      if (file.size >= constants.MAX_FILE_UPLOAD_SIZE) {
        that.setState({
          showAlert: true,
          alertData: {
            message: (
              <FormattedMessage
                id="alert.message24"
                defaultMessage="File size cannot exceed {MAX_FILE_UPLOAD_SIZE}"
                values={{ MAX_FILE_UPLOAD_SIZE: bytesToSize(constants.MAX_FILE_UPLOAD_SIZE) }}
              />),
            onConfirm: () => that.setState({showAlert: false})
          }
        })
      } else {
        fileReader.readAsDataURL(file);
      }
    } else {
      /* image upload */
      imgReader.readAsDataURL(file);
    }

    fileReader.onloadend = function () {
        let range = that.state.selection

        const fileInfo = {
            fileId:     ['attachment', file.size, file.type, file.lastModified, attachedObjs.length].join('-'),
            fileClass:  constants.ATTACHMENT_CLASS_NAME,
            fileName:   file.name,
            fileSize:   file.size,
        }

        /* This is the attachment html element to show in editor */
        const attachmentHTML = `<div class="${fileInfo.fileClass}" style="display: flex; flex-direction: row; font-family: sans-serif; width: calc(100% - 16px); padding: 8px; border: solid 1px #bbbbbb; border-radius: 12px; margin: auto 0px; cursor: pointer;">
                                  <div class="attachment-icon" style="background-image: url(/images/icon_attach@2x.png); background-repeat: no-repeat; background-size: 50px; width: 50px; min-height:50px; min-width:50px; margin-right: 10px;">
                                  </div>
                                  <div class="attachment-meta" style="display: flex; flex-direction: column; width: calc(100% - 50px); ">
                                    <div class="attachment-title" title="${fileInfo.fileName}" style="padding:2px 5px; height: 20px; line-height: 24px; font-size: 16px; color: #484848; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">
                                      ${fileInfo.fileName}
                                    </div>
                                    <div class="attachment-size" style="padding:2px 5px; height: 20px; line-height: 24px; font-size: 13px; color: #b1b1b1;">
                                      ${bytesToSize(fileInfo.fileSize)}
                                    </div>
                                  </div>
                                </div>`;

        /* Insert as an iframe element */
        editor.insertEmbed(range.index, 'attachment', {
          id:     fileInfo.fileId,
          class:  fileInfo.fileClass,
          name:   file.name,
          size:   file.size,
          type:   file.type,
          value:  attachmentHTML,
        });

        /* New attachment */
        attachedObjs.push({
          'id':     fileInfo.fileId,
          'data':   fileReader.result,
          'file':   file,
          'type':   'FILE'
        })

        /* Update cursor selection */
        let newRange = {
          index:  range.index + 1,
          length: range.length,
        }

        editor.setSelection(newRange)

        that.setState({
          selection:  newRange,
          editor:     editor,
          attachedObjs: attachedObjs,
          contentChanged: true,
        })
    }

    imgReader.onloadend = function () {
      getOrientation(file, (orientation) => {

        let image = new Image();
        image.src = imgReader.result;
        image.onload = function (imageEvent) {

            /* Resize image if too large */
            let canvas    = document.createElement('canvas'),
                max_size  = constants.MAX_EDITOR_IMG_WIDTH,
                width     = image.width,
                height    = image.height;

            if (width > height) {
                if (width > max_size) {
                    height *= max_size / width;
                    width = max_size;
                }
            } else {
                if (height > max_size) {
                    width *= max_size / height;
                    height = max_size;
                }
            }
            canvas.width  = width;
            canvas.height = height;
            canvas.getContext('2d').drawImage(image, 0, 0, width, height);

            /* Adjust Orientation for mobile */
            let oriWidth  = width
            let oriHeight = height
            let degrees   = 0

            if (orientation === 6) {
              degrees = 90;
            } else if (orientation === 3) {
              degrees = 180;
            } else if (orientation === 8) {
              degrees = 270;
            }

            let newSize   = newCanvasSize(oriWidth, oriHeight, degrees);
            canvas.width  = newSize[0];
            canvas.height = newSize[1];

            let ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(canvas.width/2, canvas.height/2);
            ctx.rotate(degrees*Math.PI/180);
            ctx.drawImage(image, -oriWidth/2, -oriHeight/2, oriWidth, oriHeight);
            ctx.restore();

            /* Update img src with data url */
            let dataUrl = canvas.toDataURL('image/jpeg');

            /* Insert into editor */
            let range           = that.state.selection
            let imageClassName  = IMAGE_CLASS_PREFIX + attachedObjs.length

            editor.updateContents(
                new Delta()
                    .retain(range.index)
                    .insert(
                        {
                            image: dataUrl
                        },
                        {
                            width: '100%',
                            nameClass: imageClassName,
                            alt: 'no working',
                            offset: 3,
                        }
                    ).insert('\n'));

            /* New attachment */
            attachedObjs.push({
              'id':     imageClassName,
              'data':   dataUrl,
              'file':   dataURLtoFile(dataUrl, file.name),
              'type':   'IMAGE'
            })

            /* Update cursor selection */
            let newRange = {
              index:  range.index + 2,
              length: range.length
            }

            editor.setSelection(newRange)

            that.setState({
              selection:  newRange,
              editor:     editor,
              attachedObjs: attachedObjs,
              contentChanged: true,
            })
        }
      })
    }
  }

  render() {

    const { isEdit, intl } = this.props
    const { editor, showAlert, alertData, selection, title } = this.state
    const placeholder = intl.formatMessage({id: 'create-article-modal.placeholder'});

    let sel = Object.keys(editor).length > 0? editor.getSelection(): null

    return (
      <div id='edit-article-modal-main-section'
           className={styles['root']}
           onClick={this.onContentClick}>
        <div className={styles['title-section']}>
          <div className={styles['prev-arrow']} onClick={this.onPrevPageClick}></div>
          <div className={styles['title-text']} title={title}>
          {
            isEdit ? (
              title
            ):(
              <input
                placeholder={placeholder}
                autoFocus
                name='title-input'
                value={title}
                onChange={this.onTitleChange}/>
            )
          }
          </div>
          <div className={styles['space']}></div>
        </div>
        <div id={this.state.id} className={styles['pttai-editor-content']}></div>
        <div className={styles['action-section']}>
          <div className={styles['upload-button']} >
            <label>
              <input type="file" id={EDITOR_INPUT_ID}
                      onChange={(e) => {
                          this.attachmentUpload(e)
                          this.setState({selection: sel ? sel : selection})
                      }}
                      onClick={
                        /* Avoid onChange to be triggered twice */
                        (e) => {
                          e.target.value = null
                        }
                      }/>
            </label>
          </div>
          {
            isEdit ? (<div className={styles['delete-button']} onClick={this.onDelete}></div>) : null
          }
          <div className={styles['submit-button']} onClick={this.onSubmit}></div>
        </div>
        <AlertComponent show={showAlert} alertData={alertData}/>
      </div>
    )
  }
}

export default injectIntl(PttaiEditor)
