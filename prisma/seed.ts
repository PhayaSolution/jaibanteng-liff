import { PrismaClient, TransactionType } from '@prisma/client';

const prisma = new PrismaClient() as PrismaClient & {
  parseMessage: {
    deleteMany: (args?: Record<string, never>) => Promise<{ count: number }>;
    create: (args: { data: { keyword: string; type: TransactionType; category: string } }) => Promise<unknown>;
  };
};

const parseMessages = [
  // Food keywords -> อาหาร
  { keyword: 'ก๋วยเตี๋ยว', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'ข้าวผัด', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'ข้าวมันไก่', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'ข้าวหมูแดง', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'ข้าวหมูกรอบ', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'ข้าวขาหมู', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'ข้าวหน้าเป็ด', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'ข้าวคลุกกะปิ', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'โจ๊ก', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'ข้าวต้ม', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'กะเพรา', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'ผัดกะเพรา', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'ผัดซีอิ๊ว', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'ราดหน้า', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'ก๋วยจั๊บ', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'เย็นตาโฟ', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'บะหมี่', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'หมี่เกี๊ยว', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'ก๋วยเตี๋ยวเรือ', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'ส้มตำ', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'ลาบ', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'น้ำตก', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'ขนมจีน', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'ข้าวซอย', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'แกงเขียวหวาน', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'พะแนง', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'มัสมั่น', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'แกงส้ม', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'ไข่เจียว', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'ข้าวไข่เจียว', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'หอยทอด', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'ขนมจีบ', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'ซาลาเปา', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'ramen', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'noodle', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'fried rice', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'pad thai', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'som tam', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'ข้าวแกง', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'ข้าวเหนียวไก่ทอด', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'ต้มยำ', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'ผัดไทย', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'ปิ้งย่าง', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'ราเมง', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'ชาบู', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'สุกี้', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'หมูกระทะ', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'ข้าวหน้าเนื้อ', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'ซูชิ', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'พิซซ่า', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'เบอร์เกอร์', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'สเต๊ก', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  { keyword: 'อาหาร', type: 'EXPENSE' as TransactionType, category: 'อาหาร' },
  
  // Beverage keywords -> เครื่องดื่ม
  { keyword: 'กาแฟ', type: 'EXPENSE' as TransactionType, category: 'เครื่องดื่ม' },
  { keyword: 'coffee', type: 'EXPENSE' as TransactionType, category: 'เครื่องดื่ม' },
  { keyword: 'ชา', type: 'EXPENSE' as TransactionType, category: 'เครื่องดื่ม' },
  { keyword: 'tea', type: 'EXPENSE' as TransactionType, category: 'เครื่องดื่ม' },

  // Transport keywords -> เดินทาง
  { keyword: 'รถไฟฟ้า', type: 'EXPENSE' as TransactionType, category: 'เดินทาง' },
  { keyword: 'bts', type: 'EXPENSE' as TransactionType, category: 'เดินทาง' },
  { keyword: 'mrt', type: 'EXPENSE' as TransactionType, category: 'เดินทาง' },
  { keyword: 'แท็กซี่', type: 'EXPENSE' as TransactionType, category: 'เดินทาง' },
  { keyword: 'taxi', type: 'EXPENSE' as TransactionType, category: 'เดินทาง' },
  { keyword: 'grab', type: 'EXPENSE' as TransactionType, category: 'เดินทาง' },
  { keyword: 'bolt', type: 'EXPENSE' as TransactionType, category: 'เดินทาง' },
  { keyword: 'ค่าน้ำมัน', type: 'EXPENSE' as TransactionType, category: 'เดินทาง' },
  { keyword: 'น้ำมันรถ', type: 'EXPENSE' as TransactionType, category: 'เดินทาง' },
  { keyword: 'ค่าทางด่วน', type: 'EXPENSE' as TransactionType, category: 'เดินทาง' },
  { keyword: 'ทางด่วน', type: 'EXPENSE' as TransactionType, category: 'เดินทาง' },
  { keyword: 'ที่จอดรถ', type: 'EXPENSE' as TransactionType, category: 'เดินทาง' },
  { keyword: 'parking', type: 'EXPENSE' as TransactionType, category: 'เดินทาง' },

  // Household/Groceries keywords -> ของใช้ในบ้าน
  { keyword: 'ของชำ', type: 'EXPENSE' as TransactionType, category: 'ของใช้ในบ้าน' },
  { keyword: 'ตลาด', type: 'EXPENSE' as TransactionType, category: 'ของใช้ในบ้าน' },
  { keyword: 'ซูเปอร์มาร์เก็ต', type: 'EXPENSE' as TransactionType, category: 'ของใช้ในบ้าน' },
  { keyword: 'supermarket', type: 'EXPENSE' as TransactionType, category: 'ของใช้ในบ้าน' },
  { keyword: 'เซเว่น', type: 'EXPENSE' as TransactionType, category: 'ของใช้ในบ้าน' },
  { keyword: '7-11', type: 'EXPENSE' as TransactionType, category: 'ของใช้ในบ้าน' },
  { keyword: '7eleven', type: 'EXPENSE' as TransactionType, category: 'ของใช้ในบ้าน' },
  { keyword: 'lotus', type: 'EXPENSE' as TransactionType, category: 'ของใช้ในบ้าน' },
  { keyword: 'bigc', type: 'EXPENSE' as TransactionType, category: 'ของใช้ในบ้าน' },
  { keyword: 'makro', type: 'EXPENSE' as TransactionType, category: 'ของใช้ในบ้าน' },
  { keyword: 'tops', type: 'EXPENSE' as TransactionType, category: 'ของใช้ในบ้าน' },

  // Shopping keywords -> ช้อปปิ้ง
  { keyword: 'ช้อปปิ้ง', type: 'EXPENSE' as TransactionType, category: 'ช้อปปิ้ง' },
  { keyword: 'shopping', type: 'EXPENSE' as TransactionType, category: 'ช้อปปิ้ง' },
  { keyword: 'shopee', type: 'EXPENSE' as TransactionType, category: 'ช้อปปิ้ง' },
  { keyword: 'lazada', type: 'EXPENSE' as TransactionType, category: 'ช้อปปิ้ง' },
  { keyword: 'tiktok shop', type: 'EXPENSE' as TransactionType, category: 'ช้อปปิ้ง' },
  { keyword: 'tiktokshop', type: 'EXPENSE' as TransactionType, category: 'ช้อปปิ้ง' },
  { keyword: 'uniqlo', type: 'EXPENSE' as TransactionType, category: 'ช้อปปิ้ง' },
  { keyword: 'central', type: 'EXPENSE' as TransactionType, category: 'ช้อปปิ้ง' },
  { keyword: 'ikea', type: 'EXPENSE' as TransactionType, category: 'ช้อปปิ้ง' },
  { keyword: 'decathlon', type: 'EXPENSE' as TransactionType, category: 'ช้อปปิ้ง' },

  // Utilities keywords -> ค่าสาธารณูปโภค
  { keyword: 'ค่าไฟ', type: 'EXPENSE' as TransactionType, category: 'ค่าสาธารณูปโภค' },
  { keyword: 'ค่าไฟฟ้า', type: 'EXPENSE' as TransactionType, category: 'ค่าสาธารณูปโภค' },
  { keyword: 'mea', type: 'EXPENSE' as TransactionType, category: 'ค่าสาธารณูปโภค' },
  { keyword: 'pea', type: 'EXPENSE' as TransactionType, category: 'ค่าสาธารณูปโภค' },
  { keyword: 'ค่าน้ำ', type: 'EXPENSE' as TransactionType, category: 'ค่าสาธารณูปโภค' },
  { keyword: 'การประปา', type: 'EXPENSE' as TransactionType, category: 'ค่าสาธารณูปโภค' },
  { keyword: 'mwa', type: 'EXPENSE' as TransactionType, category: 'ค่าสาธารณูปโภค' },
  { keyword: 'ค่าแก๊ส', type: 'EXPENSE' as TransactionType, category: 'ค่าสาธารณูปโภค' },
  { keyword: 'electricity', type: 'EXPENSE' as TransactionType, category: 'ค่าสาธารณูปโภค' },
  { keyword: 'water bill', type: 'EXPENSE' as TransactionType, category: 'ค่าสาธารณูปโภค' },

  // Internet/Phone keywords -> โทรศัพท์/อินเทอร์เน็ต
  { keyword: 'ค่าเน็ต', type: 'EXPENSE' as TransactionType, category: 'โทรศัพท์/อินเทอร์เน็ต' },
  { keyword: 'ค่าอินเทอร์เน็ต', type: 'EXPENSE' as TransactionType, category: 'โทรศัพท์/อินเทอร์เน็ต' },
  { keyword: 'internet', type: 'EXPENSE' as TransactionType, category: 'โทรศัพท์/อินเทอร์เน็ต' },
  { keyword: 'wifi', type: 'EXPENSE' as TransactionType, category: 'โทรศัพท์/อินเทอร์เน็ต' },
  { keyword: 'ais', type: 'EXPENSE' as TransactionType, category: 'โทรศัพท์/อินเทอร์เน็ต' },
  { keyword: 'truemove', type: 'EXPENSE' as TransactionType, category: 'โทรศัพท์/อินเทอร์เน็ต' },
  { keyword: 'dtac', type: 'EXPENSE' as TransactionType, category: 'โทรศัพท์/อินเทอร์เน็ต' },
  { keyword: 'โทรศัพท์', type: 'EXPENSE' as TransactionType, category: 'โทรศัพท์/อินเทอร์เน็ต' },
  { keyword: 'มือถือ', type: 'EXPENSE' as TransactionType, category: 'โทรศัพท์/อินเทอร์เน็ต' },
  { keyword: 'mobile', type: 'EXPENSE' as TransactionType, category: 'โทรศัพท์/อินเทอร์เน็ต' },

  // Housing keywords -> ที่อยู่อาศัย
  { keyword: 'ค่าเช่า', type: 'EXPENSE' as TransactionType, category: 'ที่อยู่อาศัย' },
  { keyword: 'rent', type: 'EXPENSE' as TransactionType, category: 'ที่อยู่อาศัย' },
  { keyword: 'คอนโด', type: 'EXPENSE' as TransactionType, category: 'ที่อยู่อาศัย' },
  { keyword: 'หอ', type: 'EXPENSE' as TransactionType, category: 'ที่อยู่อาศัย' },
  { keyword: 'ค่าส่วนกลาง', type: 'EXPENSE' as TransactionType, category: 'ที่อยู่อาศัย' },

  // Health keywords -> สุขภาพ
  { keyword: 'โรงพยาบาล', type: 'EXPENSE' as TransactionType, category: 'สุขภาพ' },
  { keyword: 'คลินิก', type: 'EXPENSE' as TransactionType, category: 'สุขภาพ' },
  { keyword: 'ค่ายา', type: 'EXPENSE' as TransactionType, category: 'สุขภาพ' },
  { keyword: 'pharmacy', type: 'EXPENSE' as TransactionType, category: 'สุขภาพ' },
  { keyword: 'ตรวจสุขภาพ', type: 'EXPENSE' as TransactionType, category: 'สุขภาพ' },
  { keyword: 'ทำฟัน', type: 'EXPENSE' as TransactionType, category: 'สุขภาพ' },
  { keyword: 'ทันตกรรม', type: 'EXPENSE' as TransactionType, category: 'สุขภาพ' },
  { keyword: 'dentist', type: 'EXPENSE' as TransactionType, category: 'สุขภาพ' },

  // Entertainment keywords -> บันเทิง
  { keyword: 'netflix', type: 'EXPENSE' as TransactionType, category: 'บันเทิง' },
  { keyword: 'spotify', type: 'EXPENSE' as TransactionType, category: 'บันเทิง' },
  { keyword: 'youtube', type: 'EXPENSE' as TransactionType, category: 'บันเทิง' },
  { keyword: 'movie', type: 'EXPENSE' as TransactionType, category: 'บันเทิง' },
  { keyword: 'cinema', type: 'EXPENSE' as TransactionType, category: 'บันเทิง' },
  { keyword: 'major cineplex', type: 'EXPENSE' as TransactionType, category: 'บันเทิง' },
  { keyword: 'sf cinema', type: 'EXPENSE' as TransactionType, category: 'บันเทิง' },
  { keyword: 'steam', type: 'EXPENSE' as TransactionType, category: 'บันเทิง' },
  { keyword: 'เกม', type: 'EXPENSE' as TransactionType, category: 'บันเทิง' },
  { keyword: 'คอนเสิร์ต', type: 'EXPENSE' as TransactionType, category: 'บันเทิง' },

  // Education keywords -> การศึกษา
  { keyword: 'ค่าเทอม', type: 'EXPENSE' as TransactionType, category: 'การศึกษา' },
  { keyword: 'คอร์ส', type: 'EXPENSE' as TransactionType, category: 'การศึกษา' },
  { keyword: 'course', type: 'EXPENSE' as TransactionType, category: 'การศึกษา' },
  { keyword: 'udemy', type: 'EXPENSE' as TransactionType, category: 'การศึกษา' },
  { keyword: 'coursera', type: 'EXPENSE' as TransactionType, category: 'การศึกษา' },
  { keyword: 'ติว', type: 'EXPENSE' as TransactionType, category: 'การศึกษา' },
  { keyword: 'หนังสือเรียน', type: 'EXPENSE' as TransactionType, category: 'การศึกษา' },

  // Personal care keywords -> ดูแลตัวเอง
  { keyword: 'ตัดผม', type: 'EXPENSE' as TransactionType, category: 'ดูแลตัวเอง' },
  { keyword: 'ทำผม', type: 'EXPENSE' as TransactionType, category: 'ดูแลตัวเอง' },
  { keyword: 'ทำเล็บ', type: 'EXPENSE' as TransactionType, category: 'ดูแลตัวเอง' },
  { keyword: 'สปา', type: 'EXPENSE' as TransactionType, category: 'ดูแลตัวเอง' },
  { keyword: 'barber', type: 'EXPENSE' as TransactionType, category: 'ดูแลตัวเอง' },
  { keyword: 'salon', type: 'EXPENSE' as TransactionType, category: 'ดูแลตัวเอง' },
  { keyword: 'watsons', type: 'EXPENSE' as TransactionType, category: 'ดูแลตัวเอง' },
  { keyword: 'boots', type: 'EXPENSE' as TransactionType, category: 'ดูแลตัวเอง' },

  // Pets keywords -> สัตว์เลี้ยง
  { keyword: 'อาหารแมว', type: 'EXPENSE' as TransactionType, category: 'สัตว์เลี้ยง' },
  { keyword: 'อาหารหมา', type: 'EXPENSE' as TransactionType, category: 'สัตว์เลี้ยง' },
  { keyword: 'pet', type: 'EXPENSE' as TransactionType, category: 'สัตว์เลี้ยง' },
  { keyword: 'vet', type: 'EXPENSE' as TransactionType, category: 'สัตว์เลี้ยง' },
  { keyword: 'คลินิกสัตว์', type: 'EXPENSE' as TransactionType, category: 'สัตว์เลี้ยง' },

  // Debt/Installment keywords -> ผ่อน/หนี้สิน
  { keyword: 'ผ่อนชำระ', type: 'EXPENSE' as TransactionType, category: 'ผ่อน/หนี้สิน' },
  { keyword: 'ผ่อนรถ', type: 'EXPENSE' as TransactionType, category: 'ผ่อน/หนี้สิน' },
  { keyword: 'ผ่อนบ้าน', type: 'EXPENSE' as TransactionType, category: 'ผ่อน/หนี้สิน' },
  { keyword: 'สินเชื่อ', type: 'EXPENSE' as TransactionType, category: 'ผ่อน/หนี้สิน' },
  { keyword: 'loan', type: 'EXPENSE' as TransactionType, category: 'ผ่อน/หนี้สิน' },
  { keyword: 'บัตรเครดิต', type: 'EXPENSE' as TransactionType, category: 'ผ่อน/หนี้สิน' },
  { keyword: 'credit card', type: 'EXPENSE' as TransactionType, category: 'ผ่อน/หนี้สิน' },

  // Insurance keywords -> ประกัน
  { keyword: 'เบี้ยประกัน', type: 'EXPENSE' as TransactionType, category: 'ประกัน' },
  { keyword: 'ประกัน', type: 'EXPENSE' as TransactionType, category: 'ประกัน' },
  { keyword: 'insurance', type: 'EXPENSE' as TransactionType, category: 'ประกัน' },

  // Donation keywords -> ทำบุญ/บริจาค
  { keyword: 'ทำบุญ', type: 'EXPENSE' as TransactionType, category: 'ทำบุญ/บริจาค' },
  { keyword: 'บริจาค', type: 'EXPENSE' as TransactionType, category: 'ทำบุญ/บริจาค' },
  { keyword: 'donate', type: 'EXPENSE' as TransactionType, category: 'ทำบุญ/บริจาค' },
  { keyword: 'donation', type: 'EXPENSE' as TransactionType, category: 'ทำบุญ/บริจาค' },

  // Gift keywords -> ของขวัญ
  { keyword: 'ซื้อของขวัญ', type: 'EXPENSE' as TransactionType, category: 'ของขวัญ' },
  
  // Income keywords
  { keyword: 'เงินเดือน', type: 'INCOME' as TransactionType, category: 'เงินเดือน' },
  { keyword: 'salary', type: 'INCOME' as TransactionType, category: 'เงินเดือน' },
  { keyword: 'โบนัส', type: 'INCOME' as TransactionType, category: 'โบนัส' },
  { keyword: 'bonus', type: 'INCOME' as TransactionType, category: 'โบนัส' },

  // Side income keywords -> รายได้เสริม
  { keyword: 'รายได้เสริม', type: 'INCOME' as TransactionType, category: 'รายได้เสริม' },
  { keyword: 'งานเสริม', type: 'INCOME' as TransactionType, category: 'รายได้เสริม' },
  { keyword: 'ฟรีแลนซ์', type: 'INCOME' as TransactionType, category: 'รายได้เสริม' },
  { keyword: 'freelance', type: 'INCOME' as TransactionType, category: 'รายได้เสริม' },
  { keyword: 'ค่าจ้าง', type: 'INCOME' as TransactionType, category: 'รายได้เสริม' },
  { keyword: 'commission', type: 'INCOME' as TransactionType, category: 'รายได้เสริม' },
  { keyword: 'คอมมิชชั่น', type: 'INCOME' as TransactionType, category: 'รายได้เสริม' },
  { keyword: 'โอที', type: 'INCOME' as TransactionType, category: 'รายได้เสริม' },
  { keyword: 'ot', type: 'INCOME' as TransactionType, category: 'รายได้เสริม' },

  // Sales income keywords -> ขายของ
  { keyword: 'ขายของ', type: 'INCOME' as TransactionType, category: 'ขายของ' },
  { keyword: 'ยอดขาย', type: 'INCOME' as TransactionType, category: 'ขายของ' },

  // Interest/Dividend keywords -> ดอกเบี้ย/ปันผล
  { keyword: 'ดอกเบี้ย', type: 'INCOME' as TransactionType, category: 'ดอกเบี้ย/ปันผล' },
  { keyword: 'interest', type: 'INCOME' as TransactionType, category: 'ดอกเบี้ย/ปันผล' },
  { keyword: 'ปันผล', type: 'INCOME' as TransactionType, category: 'ดอกเบี้ย/ปันผล' },
  { keyword: 'dividend', type: 'INCOME' as TransactionType, category: 'ดอกเบี้ย/ปันผล' },

  // Refund/Cashback keywords -> คืนเงิน/แคชแบค
  { keyword: 'คืนเงิน', type: 'INCOME' as TransactionType, category: 'คืนเงิน/แคชแบค' },
  { keyword: 'เงินคืน', type: 'INCOME' as TransactionType, category: 'คืนเงิน/แคชแบค' },
  { keyword: 'refund', type: 'INCOME' as TransactionType, category: 'คืนเงิน/แคชแบค' },
  { keyword: 'cashback', type: 'INCOME' as TransactionType, category: 'คืนเงิน/แคชแบค' },

  // Gift/Prize keywords -> ของขวัญ/รางวัล
  { keyword: 'ได้รับของขวัญ', type: 'INCOME' as TransactionType, category: 'ของขวัญ/รางวัล' },
  { keyword: 'รางวัล', type: 'INCOME' as TransactionType, category: 'ของขวัญ/รางวัล' },
  { keyword: 'prize', type: 'INCOME' as TransactionType, category: 'ของขวัญ/รางวัล' },
  { keyword: 'หวย', type: 'INCOME' as TransactionType, category: 'ของขวัญ/รางวัล' },
  { keyword: 'lottery', type: 'INCOME' as TransactionType, category: 'ของขวัญ/รางวัล' },
];

async function main() {
  console.log('Starting seed...');

  // Clear existing parse messages
  await prisma.parseMessage.deleteMany({});
  console.log('Cleared existing parse messages');

  // Create parse messages
  for (const message of parseMessages) {
    await prisma.parseMessage.create({
      data: message,
    });
  }

  console.log(`Created ${parseMessages.length} parse messages`);
  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

