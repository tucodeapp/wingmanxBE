## IOS FLOW

1. Appse ivyksta successful subscription purchase.
2. Siunciame receipt i tavo nauja sukurta endpoint.
3. naujame endpointe vykdome ios receipt validacija:

```javascript
const validateReceipt = asyncHandler(async (req, res) => {
  const { receipt, userEmail } = req.body;

  if (!receipt || !userEmail) {
    return res.status(400).json({ message: "Missing receipt or user ID" });
  }

  const response = await axios.post(
    "https://sandbox.itunes.apple.com/verifyReceipt",
    {
      "receipt-data": receipt,
      password: "ac06543ca9d44f6086d600cb40246693",
    }
  );

  if (response.data.status === 0) {
    const { original_transaction_id } = response.data.latest_receipt_info.sort(
      (a, b) => Number(b.expires_date_ms) - Number(a.expires_date_ms)
    )[0];

    await User.findOneAndUpdate(
      { email: userEmail },
      {
        // Suradus useri as pridedu situos values prie user.subscription objecto
        $set: {
          // Sito reikes susirasti useri
          "subscription.originalTransactionId": original_transaction_id,
          // Flagas, kad isnaudojom nuolaida
          "subscription.isIntroOfferPeriodExpired": true,
          // Flagas, kad turim subscriptiona
          "subscription.isUserSubscribedToIAP": true,
        },
      },
      { new: true, upsert: true }
    );

    // Reiktu statusa grazinti. Jeigu statusas 0 tada as callinu finishTransaction appse ir tada pilnai uzfiksuoajme pardavima ir gauname notification is Apple i notifications endpointa
    res
      .status(200)
      .json({ message: "Subscription updated", status: response.data.status });
  } else {
    res.status(400).json({ message: "Ooops something went wrong" });
  }
});
```

## Android FLOW

1. Androide iskarto siunciamas notification i notifcation endpointa.

## Notification endpointas

```javascript
const receiveNotifications = async (req, res) => {
  try {
    const notificationData = req.body;

    res.status(200).send("Notification received");

    // Cia Androido flow.
    if (!notificationData.signedPayload) {
      const decodedData = base64.decode(notificationData?.message.data);

      const {
        subscriptionNotification: { purchaseToken, subscriptionId },
        packageName,
      } = JSON.parse(decodedData);

      try {
        // Pasiemam accessTokena is musu BE
        const res = await axios.post(
          `https://app.wingmanx.ai/api/app/token`,
          {}
        );
        const url =
          "https://androidpublisher.googleapis.com/androidpublisher/v3/applications" +
          `/${packageName}/purchases/subscriptions/${subscriptionId}` +
          `/tokens/${purchaseToken}?access_token=${res.data.token}`;

        const response = await axios.get(url);

        console.log(response.data, "ANDROID RESULT");
      } catch (error) {}
    } else {
      // Cia IOS FLOW
      const decoded = jwt.decode(notificationData?.signedPayload, {
        complete: true,
      });

      const { signedTransactionInfo, signedRenewalInfo } =
        decoded?.payload?.data;

      if (signedTransactionInfo && signedRenewalInfo) {
        const decodedTransactionInfo = jwt.decode(signedTransactionInfo, {
          complete: true,
        });
        const transactionInfoPayload = decodedTransactionInfo.payload;

        const decodedRenewalInfo = jwt.decode(signedRenewalInfo, {
          complete: true,
        });
        const renewalInfoPayload = decodedRenewalInfo.payload;

        console.log(transactionInfoPayload);
        console.log(renewalInfoPayload);

        // Ir va cia reiktu pradeti ieskot userio pagal  transactionInfoPayload.originalTransactionId ir tada handlinti viska pagal info kuria nurodysiu zemiau.
      }
    }
  } catch (error) {
    console.error("Error handling notification: ", error);
    res.status(500).send("Internal Server Error.");
  }
};
```

## IOS Notification PAVYZDZIAI:

### Subas su nuolaida.

```javascript


// Cekio informacija
{
  transactionId: '2000000708915755',
  originalTransactionId: '2000000708915755',
  webOrderLineItemId: '2000000073537378',
  bundleId: 'com.wingmanx',
  productId: 'wingmanxmonthly',
  subscriptionGroupIdentifier: '21519369',
  purchaseDate: 1725878807000,
  originalPurchaseDate: 1725878808000,
  expiresDate: 1725879107000,
  quantity: 1,
  type: 'Auto-Renewable Subscription',
  inAppOwnershipType: 'PURCHASED',
  signedDate: 1725878815681,
  offerType: 1,
  environment: 'Sandbox',
  transactionReason: 'PURCHASE',
  storefront: 'LTU',
  storefrontId: '143520',
  // Kaina su nuolaida
  price: 17990,
  currency: 'EUR',
  offerDiscountType: 'PAY_UP_FRONT'
}

// Subscriptiono informacija
{
  originalTransactionId: '2000000708915755',
  autoRenewProductId: 'wingmanxmonthly',
  productId: 'wingmanxmonthly',
  // 1 reiskia all good, 0 reiskia, kad nebeatsinaujina subas.
  autoRenewStatus: 1,
  // Cia rodo pilna kaina sito subo.
  renewalPrice: 34990,
  currency: 'EUR',
  signedDate: 1725878815681,
  environment: 'Sandbox',
  recentSubscriptionStartDate: 1725878807000,
  renewalDate: 1725879107000
}

```

### Praejo menesis. Subas atsinaujino:

```javascript
{
  // Naujo transactiono naujas id
  transactionId: '2000000708922025',
  // Orginalus transactionId pagal kuri ieskome userio
  originalTransactionId: '2000000708915755',
  webOrderLineItemId: '2000000073537379',
  bundleId: 'com.wingmanx',
  productId: 'wingmanxmonthly',
  subscriptionGroupIdentifier: '21519369',
  purchaseDate: 1725879107000,
  originalPurchaseDate: 1725878808000,
  expiresDate: 1725879407000,
  quantity: 1,
  type: 'Auto-Renewable Subscription',
  inAppOwnershipType: 'PURCHASED',
  signedDate: 1725879059990,
  environment: 'Sandbox',
  transactionReason: 'RENEWAL',
  storefront: 'LTU',
  storefrontId: '143520',
// Pilna kaina
  price: 34990,
  currency: 'EUR'
}
{
  originalTransactionId: '2000000708915755',
  autoRenewProductId: 'wingmanxmonthly',
  productId: 'wingmanxmonthly',
  // Statusas vis dar 1
  autoRenewStatus: 1,
  renewalPrice: 34990,
  currency: 'EUR',
  signedDate: 1725879059990,
  environment: 'Sandbox',
  recentSubscriptionStartDate: 1725878807000,
  renewalDate: 1725879407000
}
```

### Useris cancelino sub:

```javascript
 {
   transactionId: '2000000708992553',
   originalTransactionId: '2000000708915755',
   webOrderLineItemId: '2000000073537927',
   bundleId: 'com.wingmanx',
   productId: 'wingmanxmonthly',
   subscriptionGroupIdentifier: '21519369',
   purchaseDate: 1725882531000,
   originalPurchaseDate: 1725878808000,
   expiresDate: 1725882831000,
   quantity: 1,
   type: 'Auto-Renewable Subscription',
   inAppOwnershipType: 'PURCHASED',
   signedDate: 1725882752382,
   environment: 'Sandbox',
   transactionReason: 'PURCHASE',
   storefront: 'LTU',
   storefrontId: '143520',
   price: 34990,
   currency: 'EUR'
 }
 {
   originalTransactionId: '2000000708915755',
   autoRenewProductId: 'wingmanxmonthly',
   productId: 'wingmanxmonthly',
   // NEBEATSINAUJINA
   autoRenewStatus: 0,
   signedDate: 1725882752382,
   environment: 'Sandbox',
   recentSubscriptionStartDate: 1725882531000,
   renewalDate: 1725882831000
 }
```

## Android Notification PAVYZDZIAI:

### Subas be nuolaidos buvo nupirktas:

```javascript
{
  startTimeMillis: '1725881668471',
  expiryTimeMillis: '1725881963839',
  autoRenewing: true,
  priceCurrencyCode: 'EUR',
  priceAmountMicros: '33990000',
  countryCode: 'LT',
  developerPayload: '',
  paymentState: 1,
  orderId: 'GPA.3376-3433-2495-09140',
  purchaseType: 0,
  acknowledgementState: 0,
  kind: 'androidpublisher#subscriptionPurchase'
}
```

### Subas be nuolaidos automatiskai prasitese po 5min:

```javascript
 {
   startTimeMillis: '1725881668471',
   expiryTimeMillis: '1725882263839',
   autoRenewing: true,
   priceCurrencyCode: 'EUR',
   priceAmountMicros: '33990000',
   countryCode: 'LT',
   developerPayload: '',
   paymentState: 1,
   orderId: 'GPA.3376-3433-2495-09140..0',
   purchaseType: 0,
   acknowledgementState: 1,
   kind: 'androidpublisher#subscriptionPurchase'
 }
```

### Subas be nuolaidos buvo sustabdytas 5 minutem:

```javascript
{
  startTimeMillis: '1725881668471',
  expiryTimeMillis: '1725882263839',
  autoRenewing: true,
  priceCurrencyCode: 'EUR',
  priceAmountMicros: '33990000',
  countryCode: 'LT',
  developerPayload: '',
  paymentState: 1,
  orderId: 'GPA.3376-3433-2495-09140..0',
  purchaseType: 0,
  autoResumeTimeMillis: '1725882563839',
  acknowledgementState: 1,
  kind: 'androidpublisher#subscriptionPurchase'
}
```

### Useris cancelino subscriptiona:

```javascript
 {
   startTimeMillis: '1725881668471',
   expiryTimeMillis: '1725882263839',
   autoRenewing: false,
   priceCurrencyCode: 'EUR',
   priceAmountMicros: '33990000',
   countryCode: 'LT',
   developerPayload: '',
   paymentState: 1,
   cancelReason: 0,
   userCancellationTimeMillis: '1725882164047',
   orderId: 'GPA.3376-3433-2495-09140..0',
   purchaseType: 0,
   acknowledgementState: 1,
   kind: 'androidpublisher#subscriptionPurchase'
 }
```
