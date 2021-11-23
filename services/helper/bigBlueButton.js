const bigBlueButtonUrl = process.env.BIG_BLUE_BUTTON_URL + process.env.BIB_BLUE_BUTTON_BASE_URL;
const crypto = require("crypto");
const request = require("../../generics/requests");
const endpoints = require('../../constants/endpoints');
const utils = require('../../generics/utils');

module.exports = class SessionsHelper {
    static async createMeeting(meetingId,meetingName,attendeePW,moderatorPW) {
        try {

            let query = "name=" + meetingName + "&meetingID=" + meetingId + "&meta_endCallbackUrl=" + process.env.BIG_BLUE_BUTTON_CALLBACK_EVENTS + "%2F" + meetingId + "&attendeePW=" + attendeePW + "&moderatorPW=" + moderatorPW;
            let checkSumGeneration = "create" + query + process.env.BIG_BLUE_BUTTON_SECRET_KEY;
            var shasum = crypto.createHash('sha1');
            let sha = shasum.update(checkSumGeneration);
            const checksum = sha.digest('hex');

            const createUrl = bigBlueButtonUrl + endpoints.CREATE_MEETING + "?" + query + "&checksum=" + checksum;
            let response = await request.get(createUrl);
            return response.success;

        } catch (error) {
            throw error;
        }
    }

    static async joinMeetingAsModerator(meetingId,mentorName,moderatorPW) {
        try {

            let query = "meetingID=" + meetingId + "&password=" + moderatorPW + "&fullName=" + mentorName;
            let checkSumGeneration = "join" + query + process.env.BIG_BLUE_BUTTON_SECRET_KEY;
            var shasum = crypto.createHash('sha1');
            shasum.update(checkSumGeneration);
            const checksum = shasum.digest('hex');

            const joinUrl = bigBlueButtonUrl + endpoints.JOIN_MEETING + "?" + query + "&checksum=" + checksum;
            return joinUrl;

        } catch (error) {
            throw error;
        }
    }

    static async joinMeetingAsAttendee(meetingId,menteeName,menteePW) {
        try {

            let query = "meetingID=" + meetingId + "&password=" + menteePW + "&fullName=" + menteeName;
            let checkSumGeneration = "join" + query + process.env.BIG_BLUE_BUTTON_SECRET_KEY;
            var shasum = crypto.createHash('sha1');
            shasum.update(checkSumGeneration);
            const checksum = shasum.digest('hex');

            const joinUrl = bigBlueButtonUrl + endpoints.JOIN_MEETING + "?" + query + "&checksum=" + checksum;
            return joinUrl;

        } catch (error) {
            throw error;
        }
    }
}