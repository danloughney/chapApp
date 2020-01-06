
import argparse
import urllib.request 

parser = argparse.ArgumentParser()

parser.add_argument("member_id", help="member ID who we are getting the QR code for")
parser.parse_args()
args = parser.parse_args()

if args.member_id == None:
    print("must provide the member_id")
    exit()

url = "https://chart.googleapis.com/chart?cht=qr&chs=110x110&chl=" + args.member_id

urllib.request.urlretrieve(url, "qrCodes/{0}.jpg".format(args.member_id))

