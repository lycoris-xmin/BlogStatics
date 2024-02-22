$(function () {
  const modal = {
    staticFile: $('#static-file-Modal'),
    staticFileDetail: $('#static-file-detail-Modal')
  };

  const fileType = $('select[name="fileType"]');
  const cardGroup = modal.staticFile.find('.static-file-card-group');
  const uploadInput = modal.staticFile.find('input[type="file"]');
  const upload = modal.staticFile.find('button.upload');

  const model = {
    lastFileType: void 0,
    fileType: '',
    active: [],
    count: 0,
    list: [],
    maxPageIndex: 0,
    pageIndex: 1,
    pageSize: 15,
    uploadType: 99,
    multiple: true,
    eye: 0,
    fileTypeEnum: {
      0: '图片',
      1: '音频',
      2: '视频',
      3: '文件'
    },
    selectedCallback: void 0,
    maxPageNumber: 7
  };

  modal.staticFile.on('shown.bs.modal', () => {
    //
    if (model.lastFileType != void 0 && model.lastFileType === model.fileType) {
      return;
    }

    load();
  });

  modal.staticFile.on('hidden.bs.modal', () => {
    cardGroup.find('.img-card').removeClass('active');
    model.active = [];
  });

  modal.staticFileDetail.on('shown.bs.modal', () => {
    let html = '';
    if (model.eye.fileType == 0) {
      html = `
      <img class="file-img" src="${model.eye.url}"  onerror="javascript:this.src='/statics/images/404.png'" />
      `;
    } else if (model.eye.fileType == 1) {
      html = `
      <div class="file-audio flex-center-center">
        <audio  src="${model.eye.url}" controls="controls"/>
      </div>
      `;
    } else if (model.eye.fileType == 2) {
      html = `
      <video class="file-video" src="${model.eye.url}" controls="controls"/>
      `;
    } else {
      html = `
      <div>
        <span>文件</span>
      </div>;
      `;
    }

    modal.staticFileDetail.find('div.file').html(html);

    modal.staticFileDetail.find('.file-name').find('span.value').text(model.eye.fileName);
    modal.staticFileDetail.find('.file-type').find('span.value').text(model.fileTypeEnum[model.eye.fileType]);
    modal.staticFileDetail.find('.file-size').find('span.value').text(model.eye.fileSize);

    const link = modal.staticFileDetail.find('.file-link').find('a.value');
    link.attr('href', model.eye.url);
    link.text(model.eye.url);
  });

  async function load() {
    modal.staticFile.find('.loading-preloader').addClass('loading');

    try {
      await getList();

      createFileGroup();

      createPagination();

      model.lastFileType = model.fileType;
    } finally {
      modal.staticFile.find('.loading-preloader').removeClass('loading');
    }
  }

  async function getList() {
    const request = window.lycoris.createRequest();
    request.url = '/staticfile/repository';
    request.data = {
      pageIndex: model.pageIndex,
      pageSize: model.pageSize
    };

    if (model.fileType != void 0 && typeof model.fileType == 'number') {
      request.data.fileType = model.fileType;
    }

    const res = await request.get();
    if (res && res.resCode == 0) {
      model.count = res.data.count;
      model.list = res.data.list;
    }
  }

  function createFileGroup() {
    model.maxPageIndex = $.getMaxPageIndex(model.count, model.pageSize);

    let html = '';

    if (model.count > 0) {
      for (let item of model.list) {
        if (item.fileType == 0) {
          // 图片
          html += `
          <div class="file-card" data-url="${item.url}" data-name="${item.fileName}" data-filetype="${item.fileType}">
            <img src="${item.url}" />
            <p>${item.fileName}</p>
            <div class="overlay">
              <div class="flex-end-center">
                <i class="mdi mdi-24px mdi-eye"></i>
                <i class="mdi mdi-24px mdi-check-circle"></i>
              </div>
            </div>
          </div>
          `;
        } else if (item.fileType == 1) {
          // 图片
          html += `
          <div class="file-card" data-url="${item.url}" data-name="${item.fileName}" data-filetype="${item.fileType}">
            <div class="file flex-center-center">
              <audio src="${item.url}" controls="controls"></audio>
            </div>
            <p>${item.fileName}</p>
            <div class="overlay">
              <div class="flex-end-center">
                <i class="mdi mdi-24px mdi-eye"></i>
                <i class="mdi mdi-24px mdi-check-circle"></i>
              </div>
            </div>
          </div>
          `;
        } else if (item.fileType == 2) {
          // 视频
          html += `
          <div class="file-card" data-url="${item.url}" data-name="${item.fileName}" data-filetype="${item.fileType}">
            <div class="file flex-center-center">
              <video src="${item.url}" controls="controls"></video>
            </div>
            <p>${item.fileName}</p>
            <div class="overlay">
              <div class="flex-end-center">
                <i class="mdi mdi-24px mdi-eye"></i>
                <i class="mdi mdi-24px mdi-check-circle"></i>
              </div>
            </div>
          </div>
          `;
        } else {
          // 文件
          let icon = 'mdi-file-document-box-outline',
            text = '';
          if (item.url.endsWith('.zip') || item.url.endsWith('.rar') || item.url.endsWith('.7z')) {
            icon = 'mdi-folder-zip';
            text = '压缩文件';
          } else if (item.url.endsWith('.html')) {
            icon = 'mdi-language-html5';
            text = 'html文件';
          } else if (item.url.endsWith('.js')) {
            icon = 'mdi-language-javascript';
            text = 'js文件';
          } else if (item.url.endsWith('.css')) {
            icon = 'mdi-language-css3';
            text = 'css样式文件';
          } else if (item.url.endsWith('.pdf')) {
            icon = 'mdi-file-pdf-box';
            text = 'pdf文件';
          }

          html += `
          <div class="file-card" data-url="${item.url}" data-name="${item.fileName}" data-filetype="${item.fileType}">
            <div class="file flex-center-center">
              <span class="mdi ${icon}"></span>
              ${text ? `<span>${text}</span>` : ''}
            </div>
            <p>${item.fileName}</p>
            <div class="overlay">
              <div class="flex-end-center">
                <i class="mdi mdi-24px mdi-eye"></i>
                <i class="mdi mdi-24px mdi-check-circle"></i>
              </div>
            </div>
          </div>
          `;
        }
      }
    }

    cardGroup.html(html);

    cardGroup.find('img').on('error', function () {
      $(this).attr('src', '/statics/images/404.png');
    });

    const pagination = modal.staticFile.find('.footer-pagination');
    const start = (model.pageIndex - 1) * model.pageSize + 1;

    if (model.pageIndex < model.maxPageIndex) {
      pagination.find('span.current').text(`${start} - ${model.pageIndex * model.pageSize}`);
    } else {
      pagination.find('span.current').text(`${start} - ${start + model.list.length - 1}`);
    }

    if (model.list.length > 0 && model.maxPageIndex > 1) {
      pagination.show();
    } else {
      pagination.hide();
    }

    pagination.find('span.total').text(model.count);
    pagination.addClass('show');

    pagination.find('.pagination-btn').addClass('show');

    registerImgCardClick();
  }

  function registerImgCardClick() {
    const cards = cardGroup.find('>div.file-card');
    cards.on('click', function () {
      const isActive = $(this).data('active') == '1';
      const url = $(this).data('url');
      const fileType = $(this).data('filetype');
      const fileName = $(this).data('name');
      if (model.multiple) {
        if (isActive) {
          $(this).data('active', '0');
          $(this).removeClass('active');
          model.active = model.active.filter(x => x.url != url);
        } else {
          $(this).data('active', '1');
          $(this).addClass('active');
          model.active.push({
            url: url,
            fileType: fileType,
            fileName: fileName
          });
        }
      } else {
        if (isActive) {
          return;
        }

        const activeCard = cardGroup.find('>div.active');
        activeCard.removeClass('active');
        activeCard.data('active', '0');

        $(this).data('active', '1');
        $(this).addClass('active');

        model.active = [
          {
            url: url,
            fileType: fileType
          }
        ];
      }
    });

    cards.find('i.mdi-eye').on('click', function (e) {
      e.stopPropagation();
      const url = $(this).parent().parent().parent().data('url');
      model.eye = model.list.filter(x => x.url == url)[0];
      modal.staticFileDetail.modal('show');
    });
  }

  function createPagination(currentPage) {
    const pagination = modal.staticFile.find('.pagination');

    currentPage = currentPage || 1;

    function getPageNumbers() {
      let startPage = 1,
        endPage = 0;

      if (model.maxPageIndex > model.maxPageNumber) {
        if (currentPage <= 3) {
          startPage = 1;
          endPage = model.maxPageNumber;
        } else if (currentPage + 3 > model.maxPageIndex) {
          startPage = model.maxPageIndex - model.maxPageNumber;
          endPage = model.maxPageIndex;
        } else {
          startPage = Math.max(1, currentPage - 3);
          endPage = Math.min(model.maxPageIndex, currentPage + 3);
        }
      } else {
        startPage = 1;
        endPage = model.maxPageIndex;
      }

      const pageNumbers = [];
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      return pageNumbers;
    }

    const pageArray = getPageNumbers();

    let html = `
    <li class="page-item page-btn" data-index="-1">
      <span class="page-link">上一页</span>
    </li>
    `;
    for (let item of pageArray) {
      html += `
      <li class="page-item page-number ${item == model.pageIndex ? 'active' : ''}" data-index="${item}">
        <span class="page-link">${item}</span>
      </li>
      `;
    }

    html += `
    <li class="page-item page-btn" data-index="1">
      <span class="page-link">下一页</span>
    </li>
    `;

    pagination.html(html);

    registerPaginationClick();
  }

  function registerPaginationClick() {
    const pagination = modal.staticFile.find('.pagination');

    pagination.find('>li.page-number').on('click', async function () {
      const pageIndex = $(this).data('index');
      if (model.pageIndex != pageIndex) {
        model.pageIndex = pageIndex;
        if (model.maxPageIndex > model.maxPageNumber) {
          createPagination($(this).data('index'));
        } else {
          pagination.find('>li.page-number').removeClass('active');
          $(this).addClass('active');
        }

        modal.staticFile.find('.loading-preloader').addClass('loading');

        try {
          await getList();
          createFileGroup();
        } finally {
          modal.staticFile.find('.loading-preloader').removeClass('loading');
        }
      }
    });

    pagination.find('>li.page-btn').on('click', function () {
      const index = parseInt($(this).data('index'));

      let pageIndex = model.pageIndex + index;
      if (pageIndex < 1 || pageIndex > model.maxPageIndex) {
        return;
      }

      pagination.find(`>li.page-number[data-index="${pageIndex}"]`).trigger('click');
    });
  }

  fileType.on('change', function () {
    model.fileType = $(this).val();

    if (model.fileType != '') {
      model.fileType = parseInt(model.fileType);
    }

    model.pageIndex = 1;
    load();

    if (model.fileType == 0) {
      uploadInput.attr('accept', '.jpg,.png,.gif,.jpeg');
    } else if (model.fileType == 1) {
      uploadInput.attr('accept', 'audio/*');
    } else if (model.fileType == 2) {
      uploadInput.attr('accept', 'video/*');
    } else {
      uploadInput.attr('accept', '*');
    }
  });

  upload.on('click', function () {
    uploadInput.trigger('click');
  });

  uploadInput.on('change', async function () {
    upload.attr('disabled', 'disabled');
    upload.addClass('loading');

    try {
      const file = $(this)[0].files[0];

      const res = await window.lycoris.fileUpload(file, model.uploadType);

      if (res && res.resCode == 0) {
        if (model.pageIndex == 1) {
          if (model.fileType == '' || model.fileType == res.data.fileType) {
            if (model.list.length == model.pageSize) {
              model.list.pop();
            }

            model.list.unshift(res.data);
            model.count++;

            createFileGroup();
          }
        }
      }
    } finally {
      //
      upload.removeAttr('disabled');
      upload.removeClass('loading');
    }
  });

  modal.staticFile.find('button.refresh').on('click', load);

  modal.staticFile.find('button.save').on('click', function () {
    if (model.selectedCallback && typeof model.selectedCallback == 'function') {
      model.selectedCallback([...model.active]);
    }
    modal.staticFile.modal('hide');
  });

  function handleScreenWidth() {
    if (window.screen.width > 1920) {
      model.pageSize = 15;
      model.maxPageNumber = 7;
    } else if (window.screen.width > 1368) {
      model.pageSize = 12;
      model.maxPageNumber = 5;
    } else if (window.screen.width > 768) {
      model.pageSize = 8;
      model.maxPageNumber = 5;
    }
  }

  this.init = () => {
    handleScreenWidth();

    window.lycoris.events.on('static-file-Modal.show', ({ uploadType, fileType, multiple = true }, selectedCallback) => {
      if (fileType != void 0 && typeof fileType == 'number') {
        model.fileType = fileType;
        modal.staticFile.find('div.static-file-header').find('.bootstrap-select').hide();
      }

      model.uploadType = uploadType;
      model.multiple = multiple;
      model.selectedCallback = selectedCallback;

      modal.staticFile.modal('show');
    });

    window.onresize = () => {
      handleScreenWidth();
      model.lastFileType = void 0;
    };
  };

  this.init();
});
