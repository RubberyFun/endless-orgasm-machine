#first manually update package.json version

VERSION=$(node -p "require('./package.json').version")
ANDROID_HOME=~/Android/sdk
sed -i -e "s/versionName \".*\"/versionName \"$VERSION\"/g" android/app/build.gradle

# Increment versionCode
CURRENT_CODE=$(grep -oP '(?<=versionCode )\d+' android/app/build.gradle)
NEW_CODE=$((CURRENT_CODE + 1))
sed -i "s/versionCode $CURRENT_CODE/versionCode $NEW_CODE/g" android/app/build.gradle

# update Info.plist version
sed -i '/CFBundleVersion/{n;s/<string>\([0-9]*\)<\/string>/<string>'$(($(grep -A 1 "CFBundleVersion" ios/App/App/Info.plist | grep -oP '(?<=<string>)\d+(?=</string>)') + 1))'<\/string>/;}' ios/App/App/Info.plist
sed -i "/CFBundleShortVersionString/{n;s/<string>.*<\/string>/<string>$VERSION<\/string>/;}" ios/App/App/Info.plist

npm run build
npx cap sync android
npx cap sync ios

#build android release apk
cd android
./gradlew assembleRelease
./gradlew bundleRelease  #WIP signing not working yet...still gotta open Android Studio
cd ..