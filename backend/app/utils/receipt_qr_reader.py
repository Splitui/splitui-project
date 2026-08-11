from pathlib import Path

import numpy as np
import zxingcpp
import cv2
import requests

CHECK_API_URL = "https://proverkacheka.com/api/v1/check/get"

def detect_qr_points(image):
    detector = cv2.QRCodeDetector()

    found, points = detector.detect(image)

    if not found or points is None:
        return None

    return points.reshape(4, 2).astype(np.float32)

def perspective_correction(image, points):
    top_left, top_right, bottom_right, bottom_left = points

    top_width = np.linalg.norm(top_right - top_left)
    bottom_width = np.linalg.norm(bottom_right - bottom_left)

    left_height = np.linalg.norm(bottom_left - top_left)
    right_height = np.linalg.norm(bottom_right - top_right)

    width = int(max(top_width, bottom_width))
    height = int(max(left_height, right_height))

    size = max(width, height)

    destination = np.array(
        [
            [0, 0],
            [size - 1, 0],
            [size - 1, size - 1],
            [0, size - 1],
        ],
        dtype=np.float32,
    )

    matrix = cv2.getPerspectiveTransform(
        points,
        destination,
    )

    corrected = cv2.warpPerspective(
        image,
        matrix,
        (size, size),
        flags=cv2.INTER_CUBIC,
        borderMode=cv2.BORDER_REPLICATE,
    )

    return corrected

def resize_white_border(corrected):
    enlarged = cv2.resize(
        corrected,
        None,
        fx=3,
        fy=3,
        interpolation=cv2.INTER_CUBIC,
    )

    border = max(20, enlarged.shape[0] // 8)

    return cv2.copyMakeBorder(
        enlarged,
        border,
        border,
        border,
        border,
        borderType=cv2.BORDER_CONSTANT,
        value=(255, 255, 255),
    )

def sharpen_image(image):
    blurred = cv2.GaussianBlur(
        image,
        ksize=(0, 0),
        sigmaX=1.5,
    )

    sharpened = cv2.addWeighted(
        image,
        1.8,
        blurred,
        -0.8,
        0,
    )

    return sharpened

def repair_white_gaps(image,kernel_size):
    binary = cv2.threshold(
        image,
        0,
        255,
        cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU,
    )[1]

    kernel = cv2.getStructuringElement(
        cv2.MORPH_RECT,
        kernel_size,
    )

    repaired = cv2.morphologyEx(
        binary,
        cv2.MORPH_CLOSE,
        kernel,
        iterations=1,
    )

    return cv2.bitwise_not(repaired)

def process_qr(image_file: str):
    image = cv2.imread(image_file)

    zxing_result = zxingcpp.read_barcode(image)

    if zxing_result is not None:
        return zxing_result.text

    upscaled = cv2.resize(
    image,
    None,
    fx=2,
    fy=2,
    interpolation=cv2.INTER_CUBIC,
    )

    zxing_result = zxingcpp.read_barcode(upscaled)
    
    if zxing_result is not None:
        return zxing_result.text

    gray = cv2.cvtColor(upscaled, cv2.COLOR_BGR2GRAY)

    clahe = cv2.createCLAHE(
    clipLimit=2.0,
    tileGridSize=(8, 8),
    )

    enhanced = clahe.apply(gray)
    
    result = zxingcpp.read_barcode(enhanced)

    if result:
        return result.text

    kernels_size = [
    (2, 2),
    (3, 1),
    (1, 3),
    ]

    for kernel_size in kernels_size:
        repaired = repair_white_gaps(enhanced,kernel_size)
        result = zxingcpp.read_barcode(repaired)
        if result:
            return result.text
    
    repaired = repair_white_gaps(enhanced,kernels_size[0])

    sharpened = sharpen_image(enhanced)

    result = zxingcpp.read_barcode(sharpened)
    if result:
        return result.text

    points = detect_qr_points(sharpened)

    if points is not None:
        corrected = perspective_correction(sharpened, points)
        prepared = resize_white_border(corrected)

        cv2.imwrite("corrected_qr.png", prepared)

        result = zxingcpp.read_barcode(prepared)

        if result:
            return result.text

    return None


def get_receipt(qr_path: str, token: str):

    qr_raw = process_qr(qr_path)
    if qr_raw is None:
        return None
    
    response = requests.post(
        CHECK_API_URL,
        data={
            "qrraw": qr_raw,
            "token": token,
        },
        timeout=(20, 60),
    )
    response.raise_for_status()
    result = response.json()

    if result.get("code") != 1:
        return None

    return result["data"]
