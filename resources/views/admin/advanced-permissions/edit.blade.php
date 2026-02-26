@extends('layouts.admin')

@section('title')
    Edit Role — {{ $role->name }}
@endsection

@section('content-header')
    <h1>Edit Role<small>{{ $role->name }}</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li><a href="{{ route('admin.advanced-permissions') }}">Advanced Permissions</a></li>
        <li class="active">Edit Role</li>
    </ol>
@endsection

@section('content')
    <div class="row">


        <div class="col-md-7">


            <form id="role-form"
                  action="{{ route('admin.advanced-permissions.update', $role->id) }}" method="POST">
                {!! csrf_field() !!}
                {!! method_field('PATCH') !!}


                <div class="box box-primary">
                    <div class="box-header with-border">
                        <h3 class="box-title">Role Details</h3>
                    </div>
                    <div class="box-body">

                        <div class="form-group">
                            <label for="name" class="control-label">
                                Name <span class="field-required"></span>
                            </label>
                            <input type="text"
                                   id="name"
                                   name="name"
                                   class="form-control"
                                   value="{{ old('name', $role->name) }}"
                                   required />
                        </div>

                        <div class="form-group">
                            <label for="description" class="control-label">
                                Description <span class="field-optional"></span>
                            </label>
                            <textarea id="description"
                                      name="description"
                                      class="form-control"
                                      rows="3">{{ old('description', $role->description) }}</textarea>
                        </div>

                    </div>
                </div>


                <div class="box box-info">
                    <div class="box-header with-border">
                        <h3 class="box-title">Admin Area Access</h3>
                        <small class="text-muted" style="margin-left:8px">
                            Overview is always accessible.
                        </small>
                    </div>
                    <div class="box-body">
                        @foreach ($sections as $groupName => $routes)
                            <h5 class="text-uppercase" style="color:#aaa;font-size:11px;letter-spacing:1px;margin-top:12px;margin-bottom:6px">
                                {{ $groupName }}
                            </h5>
                            <div class="row">
                                @foreach ($routes as $prefix => $label)
                                    @php $inputId = 'perm_' . str_replace(['.', '-'], '_', $prefix); @endphp
                                    <div class="col-sm-6">
                                        <div class="checkbox checkbox-primary" style="margin:4px 0">
                                            <input type="checkbox" id="{{ $inputId }}" name="admin_routes[]" value="{{ $prefix }}" {{ in_array($prefix, old('admin_routes', $role->admin_routes ?? [])) ? 'checked' : '' }}>
                                            <label for="{{ $inputId }}">{{ $label }}</label>
                                        </div>
                                    </div>
                                @endforeach
                            </div>
                            <hr style="margin:8px 0">
                        @endforeach
                    </div>
                </div>


                <div class="box box-success" id="user-area-access-box"
                     style="{{ in_array('special.server_access', $role->admin_routes ?? []) ? '' : 'display:none' }}">
                    <div class="box-header with-border">
                        <h3 class="box-title">User Area Access</h3>
                        <small class="text-muted" style="margin-left:8px">
                            All the permissions are given by default. To restrict access to specific pages, select only the ones this role should be allowed to access.
                        </small>
                    </div>
                    <div class="box-body">
                        @foreach ($serverSections as $sectionName => $pages)
                            <h5 class="text-uppercase" style="color:#aaa;font-size:11px;letter-spacing:1px;margin-top:12px;margin-bottom:6px">
                                {{ $sectionName }}
                            </h5>
                            <div class="row">
                                @foreach ($pages as $pageKey => $pageData)
                                    @php $cbId = 'sp_' . str_replace(['.', '-'], '_', $pageKey); @endphp
                                    <div class="col-sm-6" style="margin-bottom:6px">
                                        <div class="checkbox checkbox-success" style="margin:2px 0">
                                            <input type="checkbox"
                                                   id="{{ $cbId }}"
                                                   name="server_permissions[]"
                                                   value="{{ $pageKey }}"
                                                   {{ in_array($pageKey, $role->server_permissions ?? []) ? 'checked' : '' }}>
                                            <label for="{{ $cbId }}">
                                                <strong>{{ $pageData['label'] }}</strong>
                                                @if (!empty($pageData['description']))
                                                    <br><small class="text-muted">{{ $pageData['description'] }}</small>
                                                @endif
                                            </label>
                                        </div>
                                    </div>
                                @endforeach
                            </div>
                            <hr style="margin:8px 0">
                        @endforeach
                    </div>
                </div>


                <div class="box box-warning" id="server-group-box"
                     style="{{ in_array('special.server_access', $role->admin_routes ?? []) ? '' : 'display:none' }}">
                    <div class="box-header with-border">
                        <h3 class="box-title">Server Group Filter</h3>
                        <small class="text-muted" style="margin-left:8px">
                            Optionally restrict which servers this role can access via Server Access.
                        </small>
                    </div>
                    <div class="box-body">

                        <div class="form-group">
                            <label class="control-label">Filter Mode</label>
                            <select name="server_group_mode" class="form-control" id="group-mode-select">
                                <option value=""
                                    {{ !$role->server_group_mode ? 'selected' : '' }}>
                                    No filter — access all servers
                                </option>
                                <option value="allow"
                                    {{ $role->server_group_mode === 'allow' ? 'selected' : '' }}>
                                    Allow only — can only access servers in the selected group
                                </option>
                                <option value="deny"
                                    {{ $role->server_group_mode === 'deny' ? 'selected' : '' }}>
                                    Deny list — can access all servers except those in the selected group
                                </option>
                            </select>
                        </div>

                        <div class="form-group" id="group-selector-wrap"
                             style="{{ $role->server_group_mode ? '' : 'display:none' }}">
                            <label class="control-label">Server Group</label>
                            <select name="server_group_id" class="form-control">
                                <option value="">— Select a server group —</option>
                                @foreach ($serverGroups as $sg)
                                    <option value="{{ $sg->id }}"
                                        {{ (int) $role->server_group_id === $sg->id ? 'selected' : '' }}>
                                        {{ $sg->name }}
                                    </option>
                                @endforeach
                            </select>
                            <p class="help-block" style="margin-top:4px">
                                <a href="{{ route('admin.advanced-permissions.server-groups') }}" target="_blank">
                                    <i class="fa fa-external-link"></i> Manage Server Groups
                                </a>
                            </p>
                        </div>

                    </div>
                </div>


                <div class="box box-default">
                    <div class="box-footer">
                        <a href="{{ route('admin.advanced-permissions') }}" class="btn btn-default btn-sm">
                            Cancel
                        </a>
                        <button type="submit" class="btn btn-success btn-sm pull-right">
                            <i class="fa fa-save"></i> Save Changes
                        </button>
                    </div>
                </div>

            </form>
            <div class="box box-danger">
                <div class="box-header with-border">
                    <h3 class="box-title">Delete Role</h3>
                </div>
                <div class="box-body">
                    <p class="no-margin">
                        Deleting this role will remove it from all assigned users. They will lose admin access immediately.
                        <strong>This action cannot be undone.</strong>
                    </p>
                </div>
                <div class="box-footer">
                    <form action="{{ route('admin.advanced-permissions.destroy', $role->id) }}"
                          method="POST"
                          onsubmit="return confirm('Are you sure you want to delete this role? All {{ $role->users_count ?? 0 }} assigned users will lose access.')">
                        {!! csrf_field() !!}
                        {!! method_field('DELETE') !!}
                        <button type="submit" class="btn btn-danger btn-sm">
                            <i class="fa fa-trash"></i> Delete Role
                        </button>
                    </form>
                </div>
            </div>

        </div>


        <div class="col-md-5">


            <div class="box box-default">
                <div class="box-header with-border">
                    <h3 class="box-title">
                        Assigned Users
                        <span class="badge" style="margin-left:6px">{{ $assignedUsers->count() }}</span>
                    </h3>
                </div>
                <div class="box-body no-padding">
                    <table class="table table-condensed" id="assigned-users-table">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Email</th>
                                <th style="width:60px"></th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse ($assignedUsers as $u)
                                <tr id="user-row-{{ $u->id }}">
                                    <td>{{ $u->username }}</td>
                                    <td class="text-muted small">{{ $u->email }}</td>
                                    <td>
                                        <button type="button"
                                                class="btn btn-xs btn-danger remove-user-btn"
                                                data-user-id="{{ $u->id }}"
                                                data-username="{{ $u->username }}">
                                            <i class="fa fa-times"></i>
                                        </button>
                                    </td>
                                </tr>
                            @empty
                                <tr id="no-users-row">
                                    <td colspan="3" class="text-center text-muted small" style="padding:12px">
                                        No users assigned to this role yet.
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>


            <div class="box box-success">
                <div class="box-header with-border">
                    <h3 class="box-title">Add User</h3>
                </div>
                <div class="box-body">
                    <div class="form-group has-feedback" style="margin-bottom:8px">
                        <input type="text"
                               id="user-search-input"
                               class="form-control"
                               placeholder="Search by username or email..."
                               autocomplete="off" />
                        <span class="fa fa-search form-control-feedback" style="pointer-events:none"></span>
                    </div>
                    <div id="search-results" style="margin-top:8px"></div>
                </div>
            </div>

        </div>

    </div>
@endsection

@section('footer-scripts')
    @parent
    <script>
    (function () {
        var roleId = {{ $role->id }};
        var searchUrl = '{{ route('admin.advanced-permissions.users.search') }}';
        var assignUrl = '/admin/advanced-permissions/' + roleId + '/users';
        var removeBaseUrl = '/admin/advanced-permissions/' + roleId + '/users/';
        var csrfToken = '{{ csrf_token() }}';

        var $input   = $('#user-search-input');
        var $results = $('#search-results');
        var searchTimer;


        $input.on('keyup', function () {
            clearTimeout(searchTimer);
            var q = $(this).val().trim();
            if (q.length < 2) { $results.html(''); return; }
            searchTimer = setTimeout(function () { doSearch(q); }, 300);
        });

        function doSearch(q) {
            $results.html('<p class="text-muted small">Searching…</p>');
            $.ajax({
                url: searchUrl,
                method: 'GET',
                data: { q: q, role_id: roleId },
                success: function (data) { renderResults(data); },
                error: function () { $results.html('<p class="text-danger small">Search failed.</p>'); }
            });
        }

        function renderResults(users) {
            if (!users.length) {
                $results.html('<p class="text-muted small" style="padding:4px 0">No users found.</p>');
                return;
            }
            var html = '<ul class="list-group" style="margin:0">';
            users.forEach(function (u) {
                var badge = '';
                var btn;
                if (u.root_admin) {
                    badge = '<span class="label label-danger pull-right" style="margin-top:2px">Root Admin</span>';
                    btn   = '<button class="btn btn-xs btn-default" disabled>Cannot Assign</button>';
                } else if (u.assigned_here) {
                    badge = '<span class="label label-warning role-badge pull-right" style="margin-top:2px">Assigned</span>';
                    btn   = '<button class="btn btn-xs btn-default assign-btn" data-user-id="' + u.id + '" disabled>Assigned</button>';
                } else if (u.has_role) {
                    badge = '<span class="label label-default pull-right" style="margin-top:2px">Other Role</span>';
                    btn   = '<button class="btn btn-xs btn-warning assign-btn" data-user-id="' + u.id + '">Reassign</button>';
                } else {
                    btn   = '<button class="btn btn-xs btn-success assign-btn" data-user-id="' + u.id + '">Assign</button>';
                }
                html += '<li class="list-group-item" style="padding:8px 12px;overflow:hidden;background:transparent;border-color:rgba(0,0,0,0.1)" id="result-' + u.id + '">'
                      + badge
                      + '<img src="https://www.gravatar.com/avatar/' + u.md5 + '?s=28&d=mm" '
                      + 'class="img-circle" style="width:28px;height:28px;margin-right:8px;vertical-align:middle">'
                      + '<strong>' + escHtml(u.username) + '</strong> '
                      + '<small class="text-muted">' + escHtml(u.email) + '</small>'
                      + '<div style="margin-top:5px">' + btn + '</div>'
                      + '</li>';
            });
            html += '</ul>';
            $results.html(html);
        }


        $results.on('click', '.assign-btn', function () {
            var $btn = $(this);
            var userId = $btn.data('user-id');
            $btn.prop('disabled', true).text('Assigning\u2026');
            $.ajax({
                url: assignUrl,
                method: 'POST',
                data: { _token: csrfToken, user_id: userId },
                success: function (resp) {
                    var u = resp.user;

                    $('#no-users-row').remove();
                    var row = '<tr id="user-row-' + u.id + '">'
                            + '<td>' + escHtml(u.username) + '</td>'
                            + '<td class="text-muted small">' + escHtml(u.email) + '</td>'
                            + '<td><button type="button" class="btn btn-xs btn-danger remove-user-btn"'
                            + ' data-user-id="' + u.id + '" data-username="' + escHtml(u.username) + '">'
                            + '<i class="fa fa-times"></i></button></td></tr>';
                    $('#assigned-users-table tbody').append(row);

                    $btn.text('Assigned').removeClass('btn-success').addClass('btn-default').prop('disabled', true);
                    $('#result-' + u.id).find('.role-badge').remove();
                    $('#result-' + u.id).prepend('<span class="label label-warning role-badge pull-right" style="margin-top:2px">Assigned</span>');
                },
                error: function (xhr) {
                    var msg = (xhr.responseJSON && (xhr.responseJSON.message || xhr.responseJSON.error)) || 'Error assigning user.';
                    alert(msg);
                    $btn.prop('disabled', false).text('Assign');
                }
            });
        });


        $(document).on('click', '.remove-user-btn', function () {
            var $btn = $(this);
            var userId = $btn.data('user-id');
            var username = $btn.data('username');
            if (!confirm('Remove ' + username + ' from this role?')) return;
            $btn.prop('disabled', true);
            $.ajax({
                url: removeBaseUrl + userId,
                method: 'POST',
                data: { _token: csrfToken, _method: 'DELETE' },
                success: function () {
                    $('#user-row-' + userId).remove();
                    if ($('#assigned-users-table tbody tr').length === 0) {
                        $('#assigned-users-table tbody').html(
                            '<tr id="no-users-row"><td colspan="3" class="text-center text-muted small" style="padding:12px">No users assigned to this role yet.</td></tr>'
                        );
                    }

                    var $resultBtn = $('#result-' + userId + ' .assign-btn');
                    if ($resultBtn.length) {
                        $resultBtn.prop('disabled', false).text('Assign').removeClass('btn-default').addClass('btn-success');
                        $('#result-' + userId + ' .badge').remove();
                    }
                },
                error: function () {
                    alert('Failed to remove user.');
                    $btn.prop('disabled', false);
                }
            });
        });

        function escHtml(str) {
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        }
    })();
    </script>


    <script>
    (function () {
        var $serverAccessCb  = $('#perm_special_server_access');
        var $groupBox        = $('#server-group-box');
        var $userAreaBox     = $('#user-area-access-box');
        var $modeSelect      = $('#group-mode-select');
        var $groupWrap       = $('#group-selector-wrap');

        function syncGroupBox() {
            if ($serverAccessCb.is(':checked')) {
                $groupBox.slideDown(150);
                $userAreaBox.slideDown(150);
            } else {
                $groupBox.slideUp(150);
                $userAreaBox.slideUp(150);
            }
        }

        function syncGroupSelector() {
            if ($modeSelect.val() !== '') {
                $groupWrap.slideDown(150);
            } else {
                $groupWrap.slideUp(150);
            }
        }

        $serverAccessCb.on('change', syncGroupBox);
        $modeSelect.on('change', syncGroupSelector);


        syncGroupBox();
        syncGroupSelector();
    })();
    </script>
@endsection
