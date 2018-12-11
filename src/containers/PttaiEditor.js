import React, { PureComponent } from 'react'
import { connect }              from 'react-redux'
import { bindActionCreators }   from 'redux'
import uuidv4                   from 'uuid/v4'
import Quill                    from 'quill'
import Delta                    from 'quill-delta'
import { FormattedMessage }     from 'react-intl'
import $                        from 'jquery'

import AlertComponent           from '../components/AlertComponent'
import { dataURLtoFile,
         bytesToSize,
         isWhitespace,
         newCanvasSize,
         getOrientation }       from '../utils/utils'

import * as doPttaiEditor     from '../reducers/PttaiEditor'
import * as constants         from '../constants/Constants'

import styles                 from './PttaiEditor.css'
import '../../node_modules/quill/dist/quill.bubble.css'

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

  return result
}

class PttaiEditor extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      id:           `editor-${ uuidv4() }`,
      editor:       {},
      initHtmlArray: props.initHtmlArray ? props.initHtmlArray : [],
      htmlContent:  props.initHtmlArray ? props.initHtmlArray.join('') : '',
      attachedObjs: [],
      selection:    { index: 0, length: 0 },
      showAlert:    false,
      alertData: {
        message:    '',
        onClose:    null,
        onConfirm:  null,
      },
    }

    this.mountQuill         = this.mountQuill.bind(this)
    this.attachmentUpload   = this.attachmentUpload.bind(this)
    this.handleChange       = this.handleChange.bind(this)
  }

  componentDidMount() {
    this.setState({ editor: this.mountQuill() });
  }

  mountQuill() {
    const { id, htmlContent, initHtmlArray } = this.state

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
      //editor.root.innerHTML = htmlContent

      initHtmlArray.reverse().forEach((arr) => {
        let currentIdx = 0
        if (arr.indexOf('<p><ifram') === 0) {

          let iframeDiv = $('.' + constants.IFRAME_CLASS_NAME)
           const fileInfo = {
                fileId:     iframeDiv.data().id,
                fileClass:  iframeDiv.data().class,
                fileName:   iframeDiv.data().name,
                fileSize:   iframeDiv.data().size,
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
            editor.insertEmbed(0, 'attachment', {
              id:     iframeDiv.data().id,
              class:  iframeDiv.data().class,
              name:   iframeDiv.data().name,
              size:   iframeDiv.data().size,
              type:   iframeDiv.data().type,
              value:  attachmentHTML,
            });

        } else {
          editor.clipboard.dangerouslyPasteHTML(currentIdx, arr, 'user');
        }
      })
      //editor.clipboard.dangerouslyPasteHTML(0, htmlContent, 'user');
    }

    return editor;
  }

  handleChange(html, htmlArray) {
    this.setState({ htmlContent: html })
    this.props.onChange(htmlArray)
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
          editor:     editor
        })

        that.props.onInsertAttachment(attachedObjs)
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
              editor:     editor
            })

            that.props.onInsertAttachment(attachedObjs)
        }
      })
    }
  }

  render() {

    const { editor, showAlert, alertData, selection } = this.state
    let sel = Object.keys(editor).length > 0? editor.getSelection(): null

    return (
      <div className={styles['root']}>
        <div id={this.state.id} className={styles['pttai-editor-content']}>
        </div>
        <div className={styles['upload-btn']} >
          <label>
            <div className={styles['camera-icon']}></div>
            <input type="file" id={EDITOR_INPUT_ID}
                    onChange={(e) => {
                        this.attachmentUpload(e)
                        this.setState({selection: sel ? sel : selection})
                    }}
                    onClick={
                      /* Avoid onChange to be triggered twice */
                      (e) => e.target.value = null
                    }/>
          </label>
        </div>
        <AlertComponent show={showAlert} alertData={alertData}/>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  ...state,
})

const mapDispatchToProps = (dispatch) => ({
  actions: {
    doPttaiEditor: bindActionCreators(doPttaiEditor, dispatch),
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(PttaiEditor)
