@extends('layouts.admin')
@section('title')
    Game Config Definitions
@endsection
@section('content-header')
    <h1>Game Config Definitions<small>Manage supported game configuration files.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Game Configs</li>
    </ol>
@endsection
@section('content')
<div class="row">
    <div class="col-xs-12">
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title">Game Definitions</h3>
                <div class="box-tools">
                    <button class="btn btn-sm btn-primary" id="add-game-btn">Create New</button>
                </div>
            </div>
            <div class="box-body table-responsive no-padding">
                <table class="table table-hover">
                    <tbody id="game-configs-tbody">
                        <tr>
                            <td colspan="4" class="text-center">
                                <i class="fa fa-spinner fa-spin"></i> Loading...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
<!-- Add/Edit Game Modal -->
<div class="modal fade" id="gameModal" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <form id="gameForm">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                    <h4 class="modal-title" id="gameModalTitle">Add New Game</h4>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="game-id" name="id">
                    <div class="form-group">
                        <label for="game-type">Game Type (Identifier)</label>
                        <input type="text" class="form-control" id="game-type" name="game_type" required>
                        <p class="text-muted small">Lowercase identifier (e.g., minecraft, ark, rust)</p>
                    </div>
                    <div class="form-group">
                        <label for="game-name">Game Name (Display)</label>
                        <input type="text" class="form-control" id="game-name" name="game_name" required>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save</button>
                </div>
            </form>
        </div>
    </div>
</div>
<!-- View Config Files Modal -->
<div class="modal fade" id="viewFilesModal" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal">&times;</button>
                <h4 class="modal-title" id="viewFilesModalTitle">Config Files</h4>
            </div>
            <div class="modal-body table-responsive no-padding">
                <table class="table table-hover">
                    <tbody id="files-tbody"></tbody>
                </table>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary" id="add-file-from-modal-btn">
                    <i class="fa fa-plus"></i> Add Config File
                </button>
            </div>
        </div>
    </div>
</div>
<!-- Add/Edit Config File Modal -->
<div class="modal fade" id="fileModal" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <form id="fileForm">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                    <h4 class="modal-title" id="fileModalTitle">Add Config File</h4>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="file-id" name="id">
                    <input type="hidden" id="file-game-id" name="game_config_definition_id">
                    <div class="form-group">
                        <label for="file-path">File Path</label>
                        <input type="text" class="form-control" id="file-path" name="path" required>
                        <p class="text-muted small">Relative to server root (e.g., server.properties)</p>
                    </div>
                    <div class="form-group">
                        <label for="file-name">Display Name</label>
                        <input type="text" class="form-control" id="file-name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="file-type">File Type</label>
                        <select class="form-control" id="file-type" name="type" required>
                            <optgroup label="Config Files">
                                <option value="properties">Properties</option>
                                <option value="yaml">YAML</option>
                                <option value="yml">YML</option>
                                <option value="ini">INI</option>
                                <option value="cfg">CFG</option>
                                <option value="conf">CONF</option>
                                <option value="config">CONFIG</option>
                                <option value="toml">TOML</option>
                                <option value="env">ENV</option>
                            </optgroup>
                            <optgroup label="Data Files">
                                <option value="json">JSON</option>
                                <option value="xml">XML</option>
                                <option value="sql">SQL</option>
                            </optgroup>
                            <optgroup label="Text & Scripts">
                                <option value="txt">TXT</option>
                                <option value="text">TEXT</option>
                                <option value="sh">Shell Script (SH)</option>
                                <option value="bash">Bash Script</option>
                            </optgroup>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="file-description">Description (Optional)</label>
                        <textarea class="form-control" id="file-description" name="description" rows="2"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
@section('footer-scripts')
    @parent
    <script>
    (function() {
        let gameDefinitions = [];
        let currentGameId = null;
        let currentFileId = null;
        function loadGameDefinitions() {
            $.ajax({
                url: '{{ route('admin.game-configs.list') }}',
                method: 'GET',
                success: function(data) {
                    gameDefinitions = data;
                    renderGameDefinitions();
                },
                error: function(xhr) {
                    swal('Error', 'Failed to load game configurations', 'error');
                }
            });
        }
        function renderGameDefinitions() {
            const tbody = $('#game-configs-tbody');
            if (gameDefinitions.length === 0) {
                tbody.html('<tr><td colspan="4" class="text-center text-muted">No game configurations found.</td></tr>');
                return;
            }
            let html = '<tr><th>ID</th><th>Name</th><th class="text-center">Config Files</th><th></th></tr>';
            gameDefinitions.forEach(function(game) {
                const fileCount = game.config_files ? game.config_files.length : 0;
                html += '<tr>' +
                    '<td><code>' + game.id + '</code></td>' +
                    '<td><a href="#" class="view-game-btn" data-game-id="' + game.id + '">' + game.game_name + '</a></td>' +
                    '<td class="text-center">' + fileCount + '</td>' +
                    '<td class="text-right">' +
                        '<button class="btn btn-xs btn-default edit-game-btn" data-game-id="' + game.id + '" style="margin-right: 5px;">Edit</button>' +
                        '<button class="btn btn-xs btn-danger delete-game-btn" data-game-id="' + game.id + '">Delete</button>' +
                    '</td>' +
                '</tr>';
            });
            tbody.html(html);
            attachEventListeners();
        }
        function renderConfigFiles(game) {
            const tbody = $('#files-tbody');
            if (!game.config_files || game.config_files.length === 0) {
                tbody.html('<tr><td colspan="4" class="text-center text-muted">No config files added yet.</td></tr>');
                return;
            }
            let html = '<tr><th>Name</th><th>Path</th><th>Type</th><th></th></tr>';
            game.config_files.forEach(function(file) {
                html += '<tr>' +
                    '<td class="middle">' + file.name + '</td>' +
                    '<td class="middle"><code>' + file.path + '</code></td>' +
                    '<td class="middle"><span class="label label-info">' + file.type.toUpperCase() + '</span></td>' +
                    '<td class="text-right">' +
                        '<button class="btn btn-xs btn-default edit-file-btn" data-file-id="' + file.id + '" data-game-id="' + game.id + '" style="margin-right: 5px;">Edit</button>' +
                        '<button class="btn btn-xs btn-danger delete-file-btn" data-file-id="' + file.id + '">Delete</button>' +
                    '</td>' +
                '</tr>';
            });
            tbody.html(html);
            attachFileEventListeners();
        }
        function attachFileEventListeners() {
            $('.edit-file-btn').off('click').on('click', function() {
                const fileId = $(this).data('file-id');
                const gameId = $(this).data('game-id');
                const game = gameDefinitions.find(function(g) { return g.id === gameId; });
                const file = game.config_files.find(function(f) { return f.id === fileId; });
                if (file) {
                    currentFileId = fileId;
                    currentGameId = gameId;
                    $('#file-id').val(file.id);
                    $('#file-game-id').val(gameId);
                    $('#file-path').val(file.path);
                    $('#file-name').val(file.name);
                    $('#file-type').val(file.type);
                    $('#file-description').val(file.description || '');
                    $('#fileModalTitle').text('Edit Config File');
                    $('#viewFilesModal').modal('hide');
                    $('#fileModal').modal('show');
                }
            });
            $('.delete-file-btn').off('click').on('click', function() {
                const fileId = $(this).data('file-id');
                swal({
                    title: 'Are you sure?',
                    text: 'Delete this config file?',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d9534f',
                    confirmButtonText: 'Yes, delete it!'
                }, function() {
                    $.ajax({
                        url: '/admin/game-configs/files/' + fileId,
                        method: 'DELETE',
                        headers: {
                            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        success: function() {
                            swal('Deleted', 'Config file deleted successfully', 'success');
                            $('#viewFilesModal').modal('hide');
                            loadGameDefinitions();
                        },
                        error: function() {
                            swal('Error', 'Failed to delete config file', 'error');
                        }
                    });
                });
            });
        }
        function attachEventListeners() {
            $('#add-game-btn').off('click').on('click', function() {
                currentGameId = null;
                $('#gameForm')[0].reset();
                $('#game-id').val('');
                $('#gameModalTitle').text('Add New Game');
                $('#gameModal').modal('show');
            });
            $('.view-game-btn').off('click').on('click', function(e) {
                e.preventDefault();
                const gameId = $(this).data('game-id');
                const game = gameDefinitions.find(function(g) { return g.id === gameId; });
                if (game) {
                    currentGameId = gameId;
                    $('#viewFilesModalTitle').text(game.game_name + ' - Config Files');
                    renderConfigFiles(game);
                    $('#viewFilesModal').modal('show');
                }
            });
            $('#add-file-from-modal-btn').off('click').on('click', function() {
                currentFileId = null;
                $('#fileForm')[0].reset();
                $('#file-id').val('');
                $('#file-game-id').val(currentGameId);
                $('#fileModalTitle').text('Add Config File');
                $('#viewFilesModal').modal('hide');
                $('#fileModal').modal('show');
            });
            $('.edit-game-btn').off('click').on('click', function(e) {
                e.stopPropagation();
                const gameId = $(this).data('game-id');
                const game = gameDefinitions.find(function(g) { return g.id === gameId; });
                if (game) {
                    currentGameId = gameId;
                    $('#game-id').val(game.id);
                    $('#game-type').val(game.game_type);
                    $('#game-name').val(game.game_name);
                    $('#gameModalTitle').text('Edit Game');
                    $('#gameModal').modal('show');
                }
            });
            $('.delete-game-btn').off('click').on('click', function(e) {
                e.stopPropagation();
                const gameId = $(this).data('game-id');
                const game = gameDefinitions.find(function(g) { return g.id === gameId; });
                swal({
                    title: 'Are you sure?',
                    text: 'Delete ' + game.game_name + ' and all its config files?',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d9534f',
                    confirmButtonText: 'Yes, delete it!'
                }, function() {
                    $.ajax({
                        url: '/admin/game-configs/' + gameId,
                        method: 'DELETE',
                        headers: {
                            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        success: function() {
                            swal('Deleted', 'Game configuration deleted successfully', 'success');
                            loadGameDefinitions();
                        },
                        error: function() {
                            swal('Error', 'Failed to delete game configuration', 'error');
                        }
                    });
                });
            });
        }
        $('#gameForm').on('submit', function(e) {
            e.preventDefault();
            const formData = {
                game_type: $('#game-type').val(),
                game_name: $('#game-name').val()
            };
            const url = currentGameId ? '/admin/game-configs/' + currentGameId : '{{ route('admin.game-configs.store') }}';
            const method = currentGameId ? 'PATCH' : 'POST';
            $.ajax({
                url: url,
                method: method,
                data: formData,
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="_token"]').attr('content'),
                    'X-Requested-With': 'XMLHttpRequest'
                },
                success: function() {
                    $('#gameModal').modal('hide');
                    swal('Success', 'Game configuration saved successfully', 'success');
                    loadGameDefinitions();
                },
                error: function(xhr) {
                    const errors = xhr.responseJSON?.errors;
                    let errorMsg = 'Failed to save game configuration';
                    if (errors) {
                        errorMsg += ':\n' + Object.values(errors).flat().join('\n');
                    }
                    swal('Error', errorMsg, 'error');
                }
            });
        });
        $('#fileForm').on('submit', function(e) {
            e.preventDefault();
            const formData = {
                path: $('#file-path').val(),
                name: $('#file-name').val(),
                type: $('#file-type').val(),
                description: $('#file-description').val()
            };
            console.log('Submitting file form:', {
                formData: formData,
                currentGameId: currentGameId,
                currentFileId: currentFileId
            });
            let url, method;
            if (currentFileId) {
                url = '/admin/game-configs/files/' + currentFileId;
                method = 'PATCH';
            } else {
                url = '/admin/game-configs/' + currentGameId + '/files';
                method = 'POST';
            }
            console.log('Request:', { url: url, method: method });
            $.ajax({
                url: url,
                method: method,
                data: formData,
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="_token"]').attr('content'),
                    'X-Requested-With': 'XMLHttpRequest'
                },
                success: function() {
                    $('#fileModal').modal('hide');
                    swal('Success', 'Config file saved successfully', 'success');
                    loadGameDefinitions();
                },
                error: function(xhr) {
                    console.error('Save file error:', xhr);
                    const errors = xhr.responseJSON?.errors;
                    const message = xhr.responseJSON?.message;
                    let errorMsg = 'Failed to save config file';
                    if (errors) {
                        errorMsg += ':\n' + Object.values(errors).flat().join('\n');
                    } else if (message) {
                        errorMsg += ': ' + message;
                    } else if (xhr.responseText) {
                        errorMsg += ': ' + xhr.statusText;
                    }
                    swal('Error', errorMsg, 'error');
                }
            });
        });
        $(document).ready(function() {
            loadGameDefinitions();
        });
    })();
    </script>
@endsection
