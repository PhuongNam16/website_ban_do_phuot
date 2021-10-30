const router = require('express').Router();

const OrderModel = require('../models/order');
const OrderStatus = require('../constants/order-status');
const Passport = require('../modules/passport');

const moment = require('moment')

router.get('/', Passport.requireAuth, async (req, res) => {
  res.redirect('/admin/order/danh-sach.html');
});

router.get('/danh-sach.html', Passport.requireAuth, async (req, res) => {
  const model = {};
  
  model.data = await OrderModel.find(
    {
      isDeleted: false
    }
  ).lean();
  
  res.render('admin/order/list', {
    model,
    moment,
  });
});

router.get('/chi-tiet/:id.html', Passport.requireAuth, async (req, res) => {
  const model = {};
  
  model.order = await OrderModel.findOne(
    {
      id: req.params.id,
      isDeleted: false
    }
  ).lean();
  
  res.render('admin/order/detail', model);
});

router.get('/thanh-toan/:id', Passport.requireAuth, async (req, res) => {
  const docOrder = await OrderModel.findOne(
    {
      id: req.params.id,
      isDeleted: false,
      status: OrderStatus.submit
    }
  ).lean();

// chuyển đổi trạng thái thanh toán
  if (!docOrder || !docOrder.id) {
    req.flash('response_message', 'Tham Số Đầu Vào Không Hợp Lệ');
  }
  else {
    await OrderModel.updateOne(
      {
        id: docOrder.id
      },
      {
        status: OrderStatus.paid
      }
    );
    
    req.flash('response_message', 'Cập Nhật Thành Công');
  }

  res.redirect(`/admin/order/chi-tiet/${req.params.id}.html`);
});

router.get('/xoa/:id', Passport.requireAuth, async (req, res) => {
  const docOrder = await OrderModel.findOne(
    {
      id: req.params.id,
      // isDeleted: false
      
    },
    {
      id: 1
    }
  ).lean();

  let sMessage = undefined;

  if (!docOrder || !docOrder.id) {
    sMessage = 'Tham Số Đầu Vào Không Hợp Lệ';
  }
  else {
    const updated = await OrderModel.updateOne(
      {
        id: docOrder.id
      },
      {
        $set: {
          isDeleted: true
        }
      }
    );
    
    if (!updated || !isObject(updated) || updated.nModified !== 1) {
      sMessage = 'Có lỗi xảy ra';
    }
    else {
      sMessage = 'Đã Xoá Thành Công';
    }
  }
   
  req.flash('response_message', sMessage);

  res.redirect('/admin/order/danh-sach.html');




  //tim oder theo so dien thoai
  const sodienthoai = '0912345678';

  const aOrder = await OrderModel.find(
    {
      isDeleted: false,
      phone: sodienthoai
    }
  ).lean();

  router.get('/search.html', async (req, res) => {
    
  });
});
module.exports = router;
