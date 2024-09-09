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
      }
    }
  } catch (error) {
    console.error("Error handling notification: ", error);
    res.status(500).send("Internal Server Error.");
  }
};





