/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { _t } from "@web/core/l10n/translation";

publicWidget.registry.hrRecruitment = publicWidget.Widget.extend({
    selector : '#hr_recruitment_form',
    events: {
        'click #apply-btn': '_onClickApplyButton',
        'focusout #recruitment2' : '_onFocusOutMail',
        'focusout #recruitment4' : '_onFocusOutLinkedin',
        'change #recruitment6': '_changeFile',
        'change #x_partner_avt': '_changeImage',
        'change #x_partner_score_board': '_changeScoreboard'
    },

    init: function () {
        this._super.apply(this, arguments);
        this.rpc = this.bindService("rpc");
    },

    willStart() {
        return Promise.all([
            this._super(),
        ]);
    },

    _changeFile(ev) {
        const fileInput = ev.currentTarget;
        const allowed = /(\.pdf|\.docx|\.doc|\.jpg|\.jpeg|\.png)$/i;
        if (!allowed.test(fileInput.value)) {
            alert(_t('Chỉ chấp nhận file định dạng .pdf, .docx, .doc, .jpg, .jpeg, hoặc .png!'));
            fileInput.value = '';
            return false;
        }
    },
    _changeImage(ev) {
        const fileInput = ev.currentTarget;
        const allowed = /(\.jpg|\.jpeg|\.png)$/i;
        if (!allowed.test(fileInput.value)) {
            alert(_t('Chỉ chấp nhận file định dạng .jpg, .jpeg, hoặc .png!'));
            fileInput.value = '';
            return false;
        }
        const file = fileInput.files[0].size;
        const max = 1024 * 1024;
        if(file > max){
            alert(_t('File phải dưới 1 MB'));
            fileInput.value = '';
            return false;
        }
        if (fileInput.files && fileInput.files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('view').src = e.target.result;
                document.getElementById('view').style.display = 'block';
            };
            reader.readAsDataURL(fileInput.files[0]);
        }
    },
    _changeScoreboard(ev) {
        const fileInput = ev.currentTarget;
        const allowed = /(\.jpg|\.jpeg|\.png|\.pdf|\.doc)$/i;
        if (!allowed.test(fileInput.value)) {
            alert(_t('Chỉ chấp nhận file định dạng .jpg, .jpeg, .png, .pdf, .doc!'));
            fileInput.value = '';
            return false;
        }
        const file = fileInput.files[0].size;
        const max = 1024 * 1024;
        if(file > max){
            alert(_t('File phải dưới 1 MB'));
            fileInput.value = '';
            return false;
        }
    },
    _onClickApplyButton (ev) {
        const $linkedin_profile = $('#recruitment4');
        const $resume = $('#recruitment6');

        const is_linkedin_empty = !$linkedin_profile.length || $linkedin_profile.val().trim() === '';
        const is_resume_empty = !$resume.length || !$resume[0].files.length;
        if (is_linkedin_empty && is_resume_empty) {
            $linkedin_profile.attr('required', true);
            $resume.attr('required', true);
        } else {
            $linkedin_profile.attr('required', false);
            $resume.attr('required', false);
        }
    },

    async _onFocusOutLinkedin (ev) {
        const linkedin = $(ev.currentTarget).val();
        if (!linkedin) {
            $(ev.currentTarget).removeClass('border-warning');
            $('#linkedin-message').removeClass('alert-warning').hide();
            return;
        }
        const linkedin_regex = /^(https?:\/\/)?([\w\.]*)linkedin\.com\/in\/(.*?)(\/.*)?$/;
        if (!linkedin_regex.test(linkedin)) {
            $('#linkedin-message').removeClass('alert-warning').hide();
            $(ev.currentTarget).addClass('border-warning');
            $('#linkedin-message').text(_t("The value entered doesn't seems like a linkedin profile.")).addClass('alert-warning').show();
        } else {
            $(ev.currentTarget).removeClass('border-warning');
            $('#linkedin-message').removeClass('alert-warning').hide();
        }
    },

    async _onFocusOutMail (ev) {
        const email = $(ev.currentTarget).val();
        if (!email) {
            $(ev.currentTarget).removeClass('border-warning');
            $('#email-message').removeClass('alert-warning').hide();
            return;
        }
        const job_id = $('#recruitment7').val();
        const data = await this.rpc('/website_hr_recruitment/check_recent_application',
            {
                email: email,
                job_id: job_id,
            });
        if (data.applied_same_job)  {
            $('#email-message').removeClass('alert-warning').hide();
            $(ev.currentTarget).addClass('border-warning');
            $('#email-message').text(_t('You already applied to this job position recently.')).addClass('alert-warning').show();
        } else if (data.applied_other_job)  {
            $('#email-message').removeClass('alert-warning').hide();
            $(ev.currentTarget).addClass('border-warning');
            $('#email-message').text(_t("You already applied to another position recently. You can continue if it's not a mistake.")).addClass('alert-warning').show();
        } else {
            $(ev.currentTarget).removeClass('border-warning');
            $('#email-message').removeClass('alert-warning').hide();
        }
    },
});
