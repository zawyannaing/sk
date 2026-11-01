export const adminCopy = {
  en: {
    nav: {
      brand: 'SHOW AI ADMIN',
      badge: 'SECURE CONSOLE v2.0',
      dashboard: 'Dashboard',
      users: 'Users & Balances',
      credits: 'Credits & Costs',
      providers: 'API Keys & Models',
      settings: 'Site Settings & Socials',
      announcements: 'Announcements',
      bundles: 'Credit Bundles',
      promo_topup: 'Promo Codes & Slips',
      flags: 'Feature Flags & Maintenance',
      audit: 'Audit Logs',
      backToApp: 'Return to Studio',
      signOut: 'Sign Out'
    },
    guard: {
      checking: 'Verifying administrative credentials with Supabase...',
      accessDeniedTitle: 'Access Denied: Administrator Role Required',
      accessDeniedDesc: 'This control panel is strictly restricted to authorized system administrators. Your account does not possess administrative privileges.',
      returnHome: 'Back to Application Home',
      signInAdmin: 'Sign In with Admin Account'
    },
    users: {
      title: 'User Accounts & Ledger History',
      subtitle: 'Manage studio creators, audit verified ledger balances, and perform manual credit adjustments.',
      searchPlaceholder: 'Search by name, email, or username...',
      filterAllRoles: 'All Roles',
      filterRoleAdmin: 'Admins Only',
      filterRoleUser: 'Creators Only',
      filterAllStatus: 'All Statuses',
      filterStatusActive: 'Active',
      filterStatusSuspended: 'Suspended',
      filterStatusBanned: 'Banned',
      colUser: 'User & Profile',
      colRole: 'Role',
      colStatus: 'Status',
      colBalance: 'Verified Ledger Balance',
      colJoined: 'Joined Date',
      colActions: 'Actions',
      adjustCreditsBtn: 'Adjust Credits',
      viewLedgerBtn: 'Ledger History',
      exportCsvBtn: 'Export CSV',
      statusChangeSuccess: 'User status successfully updated.',
      adjustSuccess: 'Credits adjusted and appended to ledger.',
      noUsersFound: 'No users found matching the filter criteria.',
      paginationShowing: 'Showing',
      paginationTo: 'to',
      paginationOf: 'of',
      paginationUsers: 'users'
    },
    adjustModal: {
      title: 'Adjust User Credits',
      subtitle: 'All adjustments are permanently logged to the append-only ledger and audit log.',
      amountLabel: 'Credit Adjustment Amount (+ to add, - to deduct)',
      amountPlaceholder: 'e.g. 500 or -250',
      reasonLabel: 'Adjustment Reason Category',
      reasonAdminAdjust: 'Admin Adjustment (Discretionary)',
      reasonRefund: 'System Refund / Error Reimbursement',
      reasonPromo: 'Special Promotional Grant',
      noteLabel: 'Internal Audit Note (Required)',
      notePlaceholder: 'Reason for manual ledger adjustment...',
      cancelBtn: 'Cancel',
      submitBtn: 'Commit Ledger Adjustment',
      processing: 'Processing Ledger...'
    },
    ledgerModal: {
      title: 'Verified Transaction Ledger',
      subtitle: 'Immutable append-only record of all credit grants, spend operations, and adjustments.',
      colDate: 'Timestamp',
      colType: 'Category',
      colAmount: 'Amount',
      colNote: 'Description & Reference',
      colActor: 'Actor',
      empty: 'No transactions found for this user in the ledger.',
      closeBtn: 'Close'
    }
  },
  my: {
    nav: {
      brand: 'SHOW AI စီမံခန့်ခွဲသူ', // TODO: native review
      badge: 'SECURE CONSOLE v2.0',
      dashboard: 'ပင်မဒက်ရှ်ဘုတ်', // TODO: native review
      users: 'အသုံးပြုသူများနှင့် Credit စာရင်း', // TODO: native review
      credits: 'Credit နှုန်းထား သတ်မှတ်ချက်', // TODO: native review
      providers: 'API Keys နှင့် AI စနစ်များ', // TODO: native review
      settings: 'ဝက်ဘ်ဆိုက်နှင့် လူမှုကွန်ရက်', // TODO: native review
      announcements: 'အသိပေးကြေညာချက်များ', // TODO: native review
      bundles: 'Credit ဝယ်ယူမှု အထုပ်များ', // TODO: native review
      promo_topup: 'Promo Code နှင့် ငွေလွှဲပြေစာများ', // TODO: native review
      flags: 'စနစ်ပြုပြင်ထိန်းသိမ်းမှု & Flags', // TODO: native review
      audit: 'Audit စာရင်းမှတ်တမ်း', // TODO: native review
      backToApp: 'စတူဒီယိုသို့ ပြန်သွားမည်', // TODO: native review
      signOut: 'အကောင့်ထွက်မည်' // TODO: native review
    },
    guard: {
      checking: 'စီမံခန့်ခွဲသူ အခွင့်အရေးကို စစ်ဆေးနေပါသည်...', // TODO: native review
      accessDeniedTitle: 'ဝင်ရောက်ခွင့် မရှိပါ: စီမံခန့်ခွဲသူသာ ဝင်ရောက်နိုင်ပါသည်', // TODO: native review
      accessDeniedDesc: 'ဤ Admin Panel သည် ခွင့်ပြုချက်ရထားသော စနစ်ထိန်းချုပ်သူများအတွက်သာ ဖြစ်ပါသည်။ သင်၏ အကောင့်တွင် စီမံခန့်ခွဲသူ အခွင့်အရေး မရှိသေးပါ။', // TODO: native review
      returnHome: 'ပင်မစာမျက်နှာသို့ ပြန်သွားမည်', // TODO: native review
      signInAdmin: 'Admin အကောင့်ဖြင့် ပြန်လည်ဝင်ရောက်မည်' // TODO: native review
    },
    users: {
      title: 'အသုံးပြုသူ အကောင့်များနှင့် စာရင်းမှတ်တမ်းများ', // TODO: native review
      subtitle: 'စတူဒီယို ဖန်တီးသူများ၊ တရားဝင် Credit စာရင်းများနှင့် Credit ဖြည့်စွက်မှုများကို စီမံခန့်ခွဲပါ။', // TODO: native review
      searchPlaceholder: 'အမည်၊ အီးမေးလ် သို့မဟုတ် username ဖြင့် ရှာဖွေပါ...', // TODO: native review
      filterAllRoles: 'Role အားလုံး', // TODO: native review
      filterRoleAdmin: 'Admin များသာ', // TODO: native review
      filterRoleUser: 'ဖန်တီးသူများသာ', // TODO: native review
      filterAllStatus: 'အခြေအနေ အားလုံး', // TODO: native review
      filterStatusActive: 'ပုံမှန် (Active)', // TODO: native review
      filterStatusSuspended: 'ခေတ္တရပ်ဆိုင်း (Suspended)', // TODO: native review
      filterStatusBanned: 'ပိတ်ပင်ထားသည် (Banned)', // TODO: native review
      colUser: 'အသုံးပြုသူ', // TODO: native review
      colRole: 'အဆင့်', // TODO: native review
      colStatus: 'အခြေအနေ', // TODO: native review
      colBalance: 'အတည်ပြုပြီး Credit လက်ကျန်', // TODO: native review
      colJoined: 'စတင်သည့်ရက်စွဲ', // TODO: native review
      colActions: 'လုပ်ဆောင်ချက်များ', // TODO: native review
      adjustCreditsBtn: 'Credit ပြင်ဆင်မည်', // TODO: native review
      viewLedgerBtn: 'မှတ်တမ်းကြည့်မည်', // TODO: native review
      exportCsvBtn: 'CSV ထုတ်ယူမည်', // TODO: native review
      statusChangeSuccess: 'အသုံးပြုသူ အခြေအနေကို အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ။', // TODO: native review
      adjustSuccess: 'Credit များကို စာရင်းမှတ်တမ်းသို့ အောင်မြင်စွာ ထည့်သွင်းပြီးပါပြီ။', // TODO: native review
      noUsersFound: 'ရှာဖွေမှုနှင့် ကိုက်ညီသော အသုံးပြုသူ မရှိပါ။', // TODO: native review
      paginationShowing: 'ပြသနေသည်', // TODO: native review
      paginationTo: 'မှ', // TODO: native review
      paginationOf: 'အနက်', // TODO: native review
      paginationUsers: 'ဦး' // TODO: native review
    },
    adjustModal: {
      title: 'Credit အတိုး/အလျော့ ပြုလုပ်ခြင်း', // TODO: native review
      subtitle: 'ပြုလုပ်သမျှ ပြင်ဆင်မှုအားလုံးကို စာရင်းမှတ်တမ်းနှင့် Audit Log တွင် အပြီးတိုင် သိမ်းဆည်းပါမည်။', // TODO: native review
      amountLabel: 'Credit ပမာဏ (ထည့်ရန် +၊ နုတ်ရန် -)', // TODO: native review
      amountPlaceholder: 'ဥပမာ 500 သို့မဟုတ် -250', // TODO: native review
      reasonLabel: 'ပြင်ဆင်ရသည့် အကြောင်းရင်း အမျိုးအစား', // TODO: native review
      reasonAdminAdjust: 'Admin စိတ်ကြိုက် ဖြည့်စွက်ခြင်း', // TODO: native review
      reasonRefund: 'စနစ်ချို့ယွင်းမှုကြောင့် ပြန်လည်ပေးအပ်ခြင်း', // TODO: native review
      reasonPromo: 'အထူးအစီအစဉ်ဖြင့် ချီးမြှင့်ခြင်း', // TODO: native review
      noteLabel: 'စာရင်းမှတ်တမ်း မှတ်ချက် (မဖြစ်မနေ ထည့်ရန်)', // TODO: native review
      notePlaceholder: 'ပြင်ဆင်ရသည့် အသေးစိတ် အကြောင်းအရာ...', // TODO: native review
      cancelBtn: 'မလုပ်တော့ပါ', // TODO: native review
      submitBtn: 'စာရင်းသို့ အတည်ပြုထည့်သွင်းမည်', // TODO: native review
      processing: 'စာရင်းသွင်းနေပါသည်...' // TODO: native review
    },
    ledgerModal: {
      title: 'အတည်ပြုပြီးသော စာရင်းမှတ်တမ်း (Ledger)', // TODO: native review
      subtitle: 'Credit အသုံးပြုမှု၊ ရရှိမှုနှင့် ပြင်ဆင်မှု အသေးစိတ် သမိုင်းမှတ်တမ်း။', // TODO: native review
      colDate: 'ရက်စွဲ/အချိန်', // TODO: native review
      colType: 'အမျိုးအစား', // TODO: native review
      colAmount: 'ပမာဏ', // TODO: native review
      colNote: 'ဖော်ပြချက်နှင့် ကိုးကားချက်', // TODO: native review
      colActor: 'ဆောင်ရွက်သူ', // TODO: native review
      empty: 'ဤအသုံးပြုသူအတွက် စာရင်းမှတ်တမ်း မရှိသေးပါ။', // TODO: native review
      closeBtn: 'ပိတ်မည်' // TODO: native review
    }
  }
};
