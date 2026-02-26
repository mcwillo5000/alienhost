@extends('layouts.admin')

@section('title')
    Edit Server Group — {{ $group->name }}
@endsection

@section('content-header')
    <h1>Edit Server Group<small>{{ $group->name }}</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li><a href="{{ route('admin.advanced-permissions') }}">Advanced Permissions</a></li>
        <li><a href="{{ route('admin.advanced-permissions.server-groups') }}">Server Groups</a></li>
        <li class="active">Edit Group</li>
    </ol>
@endsection

@section('content')
    <div class="row">


        <div class="col-md-5">


            <form action="{{ route('admin.advanced-permissions.server-groups.update', $group->id) }}" method="POST">
                {!! csrf_field() !!}
                {!! method_field('PATCH') !!}

                <div class="box box-primary">
                    <div class="box-header with-border">
                        <h3 class="box-title">Group Details</h3>
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
                                   value="{{ old('name', $group->name) }}"
                                   required />
                        </div>

                        <div class="form-group">
                            <label for="description" class="control-label">
                                Description <span class="field-optional"></span>
                            </label>
                            <textarea id="description"
                                      name="description"
                                      class="form-control"
                                      rows="3">{{ old('description', $group->description) }}</textarea>
                        </div>

                    </div>
                    <div class="box-footer">
                        <a href="{{ route('admin.advanced-permissions.server-groups') }}"
                           class="btn btn-default btn-sm">Back to Groups</a>
                        <button type="submit" class="btn btn-success btn-sm pull-right">
                            <i class="fa fa-save"></i> Save Changes
                        </button>
                    </div>
                </div>

            </form>


            @if ($roles->count() > 0)
                <div class="box box-info">
                    <div class="box-header with-border">
                        <h3 class="box-title">
                            Used by Roles
                            <span class="badge" style="margin-left:6px">{{ $roles->count() }}</span>
                        </h3>
                    </div>
                    <div class="box-body no-padding">
                        <table class="table table-condensed" style="margin:0">
                            <tbody>
                                @foreach ($roles as $role)
                                    <tr>
                                        <td>
                                            <a href="{{ route('admin.advanced-permissions.edit', $role->id) }}">
                                                {{ $role->name }}
                                            </a>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            @endif


            <div class="box box-danger">
                <div class="box-header with-border">
                    <h3 class="box-title">Delete Group</h3>
                </div>
                <div class="box-body">
                    <p class="no-margin">
                        Deleting this group will remove it from all roles that reference it.
                        The servers themselves will <strong>not</strong> be deleted.
                    </p>
                </div>
                <div class="box-footer">
                    <form action="{{ route('admin.advanced-permissions.server-groups.destroy', $group->id) }}"
                          method="POST"
                          onsubmit="return confirm('Delete server group \"{{ $group->name }}\"? This will remove it from {{ $roles->count() }} role(s).')">
                        {!! csrf_field() !!}
                        {!! method_field('DELETE') !!}
                        <button type="submit" class="btn btn-danger btn-sm">
                            <i class="fa fa-trash"></i> Delete Group
                        </button>
                    </form>
                </div>
            </div>

        </div>


        <div class="col-md-7">


            <div class="box box-default">
                <div class="box-header with-border">
                    <h3 class="box-title">
                        Servers in this Group
                        <span class="badge" id="server-count-badge" style="margin-left:6px">{{ $servers->count() }}</span>
                    </h3>
                </div>
                <div class="box-body no-padding">
                    <table class="table table-condensed" id="servers-table">
                        <thead>
                            <tr>
                                <th>Server</th>
                                <th>UUID</th>
                                <th>Owner</th>
                                <th style="width:60px"></th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse ($servers as $s)
                                <tr id="server-row-{{ $s->id }}">
                                    <td><strong>{{ $s->name }}</strong></td>
                                    <td class="text-muted small">{{ $s->uuidShort }}</td>
                                    <td class="text-muted small">{{ $s->user?->username ?? '?' }}</td>
                                    <td>
                                        <button type="button"
                                                class="btn btn-xs btn-danger remove-server-btn"
                                                data-server-id="{{ $s->id }}"
                                                data-server-name="{{ $s->name }}">
                                            <i class="fa fa-times"></i>
                                        </button>
                                    </td>
                                </tr>
                            @empty
                                <tr id="no-servers-row">
                                    <td colspan="4" class="text-center text-muted small" style="padding:12px">
                                        No servers in this group yet.
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>


            <div class="box box-success">
                <div class="box-header with-border">
                    <h3 class="box-title">Add Server</h3>
                </div>
                <div class="box-body">
                    <div class="form-group has-feedback" style="margin-bottom:8px">
                        <input type="text"
                               id="server-search-input"
                               class="form-control"
                               placeholder="Search by server name or UUID…"
                               autocomplete="off" />
                        <span class="fa fa-search form-control-feedback" style="pointer-events:none"></span>
                    </div>
                    <div id="server-search-results" style="margin-top:8px"></div>
                </div>
            </div>

        </div>

    </div>
@endsection

@section('footer-scripts')
    @parent
    <script>
    (function () {
        var groupId      = {{ $group->id }};
        var searchUrl    = '{{ route('admin.advanced-permissions.server-groups.servers.search', $group->id) }}';
        var addUrl       = '/admin/advanced-permissions/server-groups/' + groupId + '/servers';
        var removeBase   = '/admin/advanced-permissions/server-groups/' + groupId + '/servers/';
        var csrfToken    = '{{ csrf_token() }}';

        var $input       = $('#server-search-input');
        var $results     = $('#server-search-results');
        var $badge       = $('#server-count-badge');
        var $tbody       = $('#servers-table tbody');
        var serverCount  = {{ $servers->count() }};
        var searchTimer;


        $input.on('keyup', function () {
            clearTimeout(searchTimer);
            var q = $(this).val().trim();
            if (q.length < 1) { $results.html(''); return; }
            searchTimer = setTimeout(function () { doSearch(q); }, 300);
        });

        function doSearch(q) {
            $results.html('<p class="text-muted small">Searching…</p>');
            $.ajax({
                url: searchUrl,
                method: 'GET',
                data: { q: q },
                success: function (data) { renderSearchResults(data); },
                error: function () { $results.html('<p class="text-danger small">Search failed.</p>'); }
            });
        }

        function renderSearchResults(servers) {
            if (!servers.length) {
                $results.html('<p class="text-muted small" style="padding:4px 0">No servers found.</p>');
                return;
            }
            var html = '<ul class="list-group" style="margin:0">';
            servers.forEach(function (s) {
                html += '<li class="list-group-item" style="padding:8px 12px;overflow:hidden;background:transparent;border-color:rgba(0,0,0,0.1)">'
                      + '<button class="btn btn-xs btn-success pull-right add-server-btn" data-server-id="' + s.id + '" style="margin-top:2px">Add</button>'
                      + '<strong>' + escHtml(s.name) + '</strong> '
                      + '<span class="text-muted small">(' + escHtml(s.uuid) + ')</span> '
                      + '<span class="text-muted small">— ' + escHtml(s.owner) + '</span>'
                      + '</li>';
            });
            html += '</ul>';
            $results.html(html);
        }


        $results.on('click', '.add-server-btn', function () {
            var $btn      = $(this);
            var serverId  = $btn.data('server-id');
            var $li       = $btn.closest('li');

            $btn.prop('disabled', true).text('Adding…');

            $.ajax({
                url: addUrl,
                method: 'POST',
                data: { server_id: serverId, _token: csrfToken },
                success: function (data) {
                    if (data.success) {
                        appendServerRow(data.server);
                        $li.remove();
                        if (!$results.find('li').length) { $results.html(''); }
                    }
                },
                error: function (xhr) {
                    var msg = xhr.responseJSON?.message ?? 'Failed to add server.';
                    $btn.prop('disabled', false).text('Add');
                    alert(msg);
                }
            });
        });

        function appendServerRow(s) {
            $('#no-servers-row').remove();
            serverCount++;
            $badge.text(serverCount);
            $tbody.append(
                '<tr id="server-row-' + s.id + '">'
              + '<td><strong>' + escHtml(s.name) + '</strong></td>'
              + '<td class="text-muted small">' + escHtml(s.uuid) + '</td>'
              + '<td class="text-muted small">' + escHtml(s.owner) + '</td>'
              + '<td><button type="button" class="btn btn-xs btn-danger remove-server-btn"'
              + ' data-server-id="' + s.id + '" data-server-name="' + escHtml(s.name) + '">'
              + '<i class="fa fa-times"></i></button></td>'
              + '</tr>'
            );
        }


        $tbody.on('click', '.remove-server-btn', function () {
            var $btn       = $(this);
            var serverId   = $btn.data('server-id');
            var serverName = $btn.data('server-name');

            if (!confirm('Remove "' + serverName + '" from this group?')) return;

            $.ajax({
                url: removeBase + serverId,
                method: 'POST',
                data: { _method: 'DELETE', _token: csrfToken },
                success: function () {
                    $('#server-row-' + serverId).remove();
                    serverCount--;
                    $badge.text(serverCount);
                    if (serverCount === 0) {
                        $tbody.html('<tr id="no-servers-row"><td colspan="4" class="text-center text-muted small" style="padding:12px">No servers in this group yet.</td></tr>');
                    }
                },
                error: function () { alert('Failed to remove server.'); }
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
@endsection
