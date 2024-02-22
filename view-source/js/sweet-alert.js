$(function () {
  $.sweetAlert = () => {
    return {
      info: async (text, title) => {
        const option = {
          icon: 'info',
          confirmButtonText: '确 定',
          text: text || '',
          title: title || '提 示'
        };

        try {
          await Swal.mixin({
            customClass: {
              confirmButton: 'btn btn-info swal-btn-text'
            },
            buttonsStyling: false
          }).fire(option);

          if (callback) {
            callback();
          }
        } catch (error) {}
      },
      success: async (text, title) => {
        const option = {
          icon: 'success',
          confirmButtonText: '确 定',
          text: text || '',
          title: title || '通 知'
        };

        try {
          await Swal.mixin({
            customClass: {
              confirmButton: 'btn btn-info swal-btn-text'
            },
            buttonsStyling: false
          }).fire(option);
        } catch (error) {}
      },
      warn: async (text, title) => {
        const option = {
          icon: 'warning',
          confirmButtonText: '确 定',
          text: text || '',
          title: title || '警 告'
        };

        try {
          await Swal.mixin({
            customClass: {
              confirmButton: 'btn btn-info swal-btn-text'
            },
            buttonsStyling: false
          }).fire(option);
        } catch (error) {}
      },
      error: async (text, title) => {
        const option = {
          icon: 'error',
          confirmButtonText: '确 定',
          text: text || '',
          title: title || '错 误'
        };

        try {
          await Swal.mixin({
            customClass: {
              confirmButton: 'btn btn-info swal-btn-text'
            },
            buttonsStyling: false
          }).fire(option);
        } catch (error) {}
      },
      confirm: async (text, title) => {
        const option = {
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: '确 定',
          cancelButtonText: '取 消',
          text: text || '',
          title: title || '通 知'
        };

        try {
          let res = await Swal.mixin({
            customClass: {
              confirmButton: 'btn btn-info swal-btn-text mr-4',
              cancelButton: 'btn btn-secondary swal-btn-text'
            },
            buttonsStyling: false
          }).fire(option);

          return res.isConfirmed;
        } catch {
          return false;
        }
      },
      custome: option => {
        return Swal.mixin({
          customClass: {
            confirmButton: 'btn btn-info swal-btn-text mr-4',
            cancelButton: 'btn btn-secondary swal-btn-text'
          },
          buttonsStyling: false
        }).fire(option);
      },
      _this: Swal
    };
  };
});
