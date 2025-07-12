package com.mercadopago.reactnative

import android.app.Activity
import android.content.Intent
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.mercadopago.android.px.core.MercadoPagoCheckout
import com.mercadopago.android.px.model.Payment
import com.mercadopago.android.px.model.PaymentResult
import com.mercadopago.android.px.model.exceptions.MercadoPagoError
import com.mercadopago.android.px.tracking.internal.MPTracker

class MercadoPagoModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "MercadoPagoModule"
    }

    @ReactMethod
    fun startCheckout(preferenceId: String, promise: Promise) {
        try {
            val checkout = MercadoPagoCheckout.Builder(reactApplicationContext, preferenceId)
                .build()
            
            // Configurar callbacks
            checkout.startPayment(reactApplicationContext, CHECKOUT_REQUEST_CODE)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("CHECKOUT_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun startCardForm(promise: Promise) {
        try {
            // Iniciar formulario nativo de tarjeta
            val cardForm = MercadoPagoCheckout.Builder(reactApplicationContext)
                .setPrivateKey("YOUR_PRIVATE_KEY")
                .build()
            
            cardForm.startCardForm(reactApplicationContext, CARD_FORM_REQUEST_CODE)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("CARD_FORM_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for RN built in Event Emitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for RN built in Event Emitter
    }

    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    private fun sendPaymentSuccessEvent(paymentResult: PaymentResult) {
        val params = Arguments.createMap().apply {
            putString("id", paymentResult.paymentId.toString())
            putString("status", paymentResult.status)
            putString("statusDetail", paymentResult.statusDetail)
            putString("paymentMethodId", paymentResult.paymentMethodId)
            putString("paymentTypeId", paymentResult.paymentTypeId)
            putDouble("transactionAmount", paymentResult.transactionAmount)
            putString("currencyId", paymentResult.currencyId)
            putString("description", paymentResult.description)
            putString("dateCreated", paymentResult.dateCreated.toString())
            putString("lastModified", paymentResult.lastModified.toString())
        }
        sendEvent("onPaymentSuccess", params)
    }

    private fun sendPaymentErrorEvent(error: MercadoPagoError) {
        val params = Arguments.createMap().apply {
            putString("message", error.message)
            putString("error", error.errorCode)
            putInt("status", error.statusCode)
        }
        sendEvent("onPaymentError", params)
    }

    private fun sendPaymentCancelEvent() {
        sendEvent("onPaymentCancel", null)
    }

    private fun sendPaymentPendingEvent(paymentResult: PaymentResult) {
        val params = Arguments.createMap().apply {
            putString("id", paymentResult.paymentId.toString())
            putString("status", "pending")
            putString("statusDetail", "pending_waiting_payment")
        }
        sendEvent("onPaymentPending", params)
    }

    companion object {
        private const val CHECKOUT_REQUEST_CODE = 1
        private const val CARD_FORM_REQUEST_CODE = 2
    }
} 